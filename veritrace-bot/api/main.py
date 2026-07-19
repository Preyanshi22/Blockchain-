#!/usr/bin/env python3
"""
VeriTrace Help Bot — FastAPI wrapper.

Exposes the LangGraph orchestrator over HTTP:
  POST /chat  — {"session_id": str, "message": str} → {"reply": str}
  GET  /health — {"status": "ok"}
"""

import os
import sys
import logging

# Add project root to path
_project_root = os.path.join(os.path.dirname(__file__), '..')
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from dotenv import load_dotenv
load_dotenv(os.path.join(_project_root, '.env'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from orchestrator.graph import run_turn, init, _init_async

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("veritrace-api")

app = FastAPI(
    title="VeriTrace Help Bot API",
    description=(
        "RAG + MCP chatbot for VeriTrace — answers how-it-works questions, "
        "queries the live backend, sends team notifications, and chains "
        "multiple tool calls in a single turn."
    ),
    version="1.0.0",
)

# CORS — wide open for hackathon simplicity
# NOTE: Lock this down before any real deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup — initialize the orchestrator graph
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def startup():
    """Initialize the LangGraph orchestrator on server start."""
    logger.info("Initializing VeriTrace orchestrator...")
    try:
        await _init_async()
        logger.info("Orchestrator ready.")
    except Exception as e:
        logger.error(f"Failed to initialize orchestrator: {e}", exc_info=True)
        # Don't crash the server — /health will still work, /chat will return errors


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    reply: str


class HealthResponse(BaseModel):
    status: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the VeriTrace Help Bot.

    The bot maintains conversation history per session_id via the LangGraph
    MemorySaver checkpointer — no separate session tracking needed.
    """
    logger.info(f"[{request.session_id}] User: {request.message[:100]}...")
    result = run_turn(request.session_id, request.message)
    logger.info(f"[{request.session_id}] Bot: {result['reply'][:100]}...")
    return ChatResponse(reply=result["reply"])


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    return HealthResponse(status="ok")
