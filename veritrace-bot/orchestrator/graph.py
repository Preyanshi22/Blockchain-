#!/usr/bin/env python3
"""
LangGraph orchestrator for VeriTrace Help Bot.

Builds a StateGraph with an agent/tools loop:
  agent (Gemini + tools) → conditional → tools (execute) → agent → ... → END

Supports multi-step tool chaining: the agent can call multiple tools in sequence
(e.g. check_duplicate → get_similar_matches → notify_discord) before producing
a final text answer, all within a single user turn.
"""

import os
import sys
import time
import asyncio
import logging
from functools import wraps

from dotenv import load_dotenv

# Load .env from project root
_project_root = os.path.join(os.path.dirname(__file__), '..')
load_dotenv(os.path.join(_project_root, '.env'), override=True)

from langchain_core.tools import tool
from langchain_core.messages import AIMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, MessagesState, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
MAX_RETRIES = 3
RETRY_BASE_DELAY = 1  # seconds

# ---------------------------------------------------------------------------
# 1. RAG tool — wraps rag/retrieve.py
# ---------------------------------------------------------------------------

# Add project root to path so we can import rag.*
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from rag.retrieve import retrieve as rag_retrieve


@tool
def retrieve_docs(query: str) -> str:
    """Search VeriTrace's internal documentation for how the system works
    (fingerprinting, dedup pipeline, matching thresholds, verify endpoint shape,
    source of truth). Use this for conceptual/how-it-works questions, not for
    looking up a specific file or content ID."""
    results = rag_retrieve(query, k=4)
    if not results:
        return "No relevant documentation found for this query."
    return "\n\n".join(f"[{r['source']}] {r['text']}" for r in results)


# ---------------------------------------------------------------------------
# 2. MCP tools — loaded from both MCP servers via langchain-mcp-adapters
# ---------------------------------------------------------------------------

async def _load_mcp_tools():
    """Load MCP tools from both backend and notify servers."""
    try:
        from langchain_mcp_adapters.client import MultiServerMCPClient

        mcp_backend_server = os.path.join(_project_root, "mcp-backend", "server.py")
        mcp_notify_server = os.path.join(_project_root, "mcp-notify", "server.py")

        client = MultiServerMCPClient({
            "backend": {
                "command": sys.executable,
                "args": [mcp_backend_server],
                "transport": "stdio",
            },
            "notify": {
                "command": sys.executable,
                "args": [mcp_notify_server],
                "transport": "stdio",
            },
        })
        tools = await client.get_tools()
        logger.info(f"Loaded {len(tools)} MCP tools: {[t.name for t in tools]}")
        return tools, client
    except Exception as e:
        logger.warning(f"Failed to load MCP tools: {e}. Continuing with RAG only.")
        return [], None


# ---------------------------------------------------------------------------
# 3. Build the LLM with tools bound
# ---------------------------------------------------------------------------

def _build_llm_with_tools(all_tools):
    """Create the ChatGroq model and bind all tools."""
    load_dotenv(os.path.join(_project_root, '.env'), override=True)
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_api_key:
        raise RuntimeError("GROQ_API_KEY is missing from .env file.")

    llm = ChatGroq(
        model_name=MODEL_NAME,
        groq_api_key=groq_api_key,
        temperature=0.2,
    )
    if all_tools:
        llm_with_tools = llm.bind_tools(all_tools)
    else:
        llm_with_tools = llm
    return llm_with_tools


# ---------------------------------------------------------------------------
# 4. Agent node with 429 retry handling
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = (
    "You are VeriTrace Help Bot, an AI assistant for the VeriTrace asset authenticity platform.\n"
    "Use available tools (retrieve_docs, check_duplicate, get_verification_status, get_similar_matches, notify_discord, notify_slack) when appropriate.\n"
    "Once you have gathered enough information to answer the user's question, provide a clear, helpful, and concise response. Do not loop tool calls unnecessarily."
)


def _make_agent_node(llm_with_tools):
    """Create the agent node function with retry-on-429 logic."""

    def agent_node(state: MessagesState):
        """Call the LLM. Retries on 429 (rate limit) with exponential backoff."""
        from langchain_core.messages import SystemMessage
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]
        last_exception = None
        for attempt in range(MAX_RETRIES + 1):
            try:
                response = llm_with_tools.invoke(messages)
                return {"messages": [response]}
            except Exception as e:
                error_str = str(e).lower()
                # Check for rate limit (429) errors
                if "429" in error_str or "rate" in error_str or "resource_exhausted" in error_str:
                    last_exception = e
                    if attempt < MAX_RETRIES:
                        delay = RETRY_BASE_DELAY * (2 ** attempt)
                        logger.warning(
                            f"Rate limited (attempt {attempt + 1}/{MAX_RETRIES + 1}), "
                            f"retrying in {delay}s..."
                        )
                        time.sleep(delay)
                        continue
                # Non-retryable error — raise immediately
                raise

        # All retries exhausted
        logger.error(f"All {MAX_RETRIES + 1} attempts failed with rate limiting.")
        fallback_msg = AIMessage(
            content=(
                "I'm currently experiencing rate limiting from the API. "
                "Please try again in a moment."
            )
        )
        return {"messages": [fallback_msg]}

    return agent_node


# ---------------------------------------------------------------------------
# 5. Conditional edge — decide whether to continue to tools or end
# ---------------------------------------------------------------------------

def should_continue(state: MessagesState):
    """Route to 'tools' if the last message has tool calls, otherwise END."""
    last_message = state["messages"][-1]
    if getattr(last_message, "tool_calls", None):
        return "tools"
    return END


# ---------------------------------------------------------------------------
# 6. Build the compiled graph
# ---------------------------------------------------------------------------

# Module-level state — populated by init()
_graph = None
_mcp_client = None
_initialized = False


async def _init_async():
    """Async initialization: load MCP tools, build and compile the graph."""
    global _graph, _mcp_client, _initialized

    if _initialized:
        return

    # Load MCP tools
    mcp_tools, _mcp_client = await _load_mcp_tools()

    # Combine all tools
    all_tools = [retrieve_docs] + list(mcp_tools)
    logger.info(f"Total tools available: {len(all_tools)} — {[t.name for t in all_tools]}")

    # Build LLM
    llm_with_tools = _build_llm_with_tools(all_tools)

    # Build graph
    agent_node = _make_agent_node(llm_with_tools)

    graph_builder = StateGraph(MessagesState)
    graph_builder.add_node("agent", agent_node)
    graph_builder.add_node("tools", ToolNode(all_tools))
    graph_builder.set_entry_point("agent")
    graph_builder.add_conditional_edges(
        "agent",
        should_continue,
        {"tools": "tools", END: END},
    )
    graph_builder.add_edge("tools", "agent")

    checkpointer = MemorySaver()
    _graph = graph_builder.compile(checkpointer=checkpointer)
    _initialized = True
    logger.info("LangGraph orchestrator initialized successfully.")


def init():
    """Synchronous wrapper to initialize the graph (safe to call from non-async code)."""
    try:
        loop = asyncio.get_running_loop()
        # Already in an async context — use nest_asyncio or create a new thread
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            pool.submit(asyncio.run, _init_async()).result()
    except RuntimeError:
        # No running loop — create one
        asyncio.run(_init_async())


# ---------------------------------------------------------------------------
# 7. Public API — run_turn()
# ---------------------------------------------------------------------------

def run_turn(session_id: str, user_message: str) -> dict:
    """
    Run one conversational turn through the LangGraph orchestrator.

    Args:
        session_id: Unique session/conversation identifier. The MemorySaver
                    checkpointer uses this as thread_id to maintain per-session
                    conversation history.
        user_message: The user's input message.

    Returns:
        {"reply": str} — the bot's final text response.
    """
    if not _initialized:
        init()

    config = {
        "configurable": {"thread_id": session_id},
        "recursion_limit": 25,
    }

    try:
        result = _graph.invoke(
            {"messages": [("user", user_message)]},
            config=config,
        )
        final_message = result["messages"][-1]

        # If the final message is a tool call (shouldn't happen, but safeguard),
        # provide a fallback response
        if getattr(final_message, "tool_calls", None):
            return {
                "reply": (
                    "I wasn't able to fully resolve this request within the allowed "
                    "number of steps. Here's what I found so far: the conversation "
                    "required more tool calls than the current limit allows. "
                    "Please try breaking your request into smaller steps."
                )
            }

        return {"reply": final_message.content}

    except Exception as e:
        error_msg = str(e)
        if "recursion" in error_msg.lower() or "limit" in error_msg.lower():
            return {
                "reply": (
                    "I wasn't able to fully resolve this request — it required more "
                    "steps than expected. Please try breaking it into smaller questions."
                )
            }
        logger.error(f"Error in run_turn: {e}", exc_info=True)
        return {
            "reply": f"An error occurred while processing your request: {error_msg}"
        }
