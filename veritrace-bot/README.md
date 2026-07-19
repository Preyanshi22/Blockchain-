# VeriTrace Help Bot

A RAG + MCP chatbot for [VeriTrace](https://veritrace.dev), a content provenance and forgery detection platform. Built with LangGraph for multi-step tool chaining, ChromaDB for document retrieval, and FastAPI for HTTP access.

## What It Does

- **Answers how-it-works questions** grounded in real VeriTrace documentation (RAG)
- **Queries the live backend** for content verification, duplicate checks, and similar matches (MCP tools)
- **Sends team notifications** to Discord and Slack on request (MCP tools)
- **Chains multiple tool calls** in a single turn — e.g. check duplicate → get matches → notify team → summarize

## Architecture

```
User → FastAPI (/chat) → LangGraph StateGraph → ┬─ RAG (ChromaDB + Gemini embeddings)
                                                  ├─ MCP Backend (VeriTrace API)
                                                  └─ MCP Notify (Discord/Slack webhooks)
```

The LangGraph orchestrator uses an agent/tools loop: the agent (Gemini) decides whether to call a tool or respond, the tools node executes, and control returns to the agent. This loop repeats until the agent produces a final text answer, enabling multi-step tool chains without hand-written branching logic.

## Setup

1. **Clone and install dependencies:**
   ```bash
   cd veritrace-bot
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your real API keys and webhook URLs
   ```

3. **Verify configuration:**
   ```bash
   python check_config.py
   ```

4. **Ingest documentation:**
   ```bash
   python rag/ingest.py
   ```

5. **Run locally (CLI):**
   ```bash
   python orchestrator/main.py
   ```

6. **Run locally (API):**
   ```bash
   uvicorn api.main:app --reload
   ```
   Then POST to `http://localhost:8000/chat`:
   ```json
   {"session_id": "test", "message": "How does fingerprinting work?"}
   ```

## Tech Stack

- **LLM**: Gemini (via langchain-google-genai)
- **Orchestration**: LangGraph StateGraph
- **RAG**: ChromaDB + Gemini text-embedding-004
- **MCP Servers**: mcp Python SDK (stdio transport)
- **API**: FastAPI + Uvicorn
- **Notifications**: Discord & Slack webhooks
