# VeriTrace Help Bot — Build Status

> This document tracks the build progress, verification results, and any assumptions or stubs.
> Updated after each phase.

## Build Progress

| Phase | Description | Status |
|-------|-------------|--------|
| Scaffold | Project structure, config, dependencies | ✅ Complete |
| Phase 1 | RAG docs + ingestion pipeline | ✅ Code complete, ⏳ pending .env for verification |
| Phase 2 | MCP backend tool server | ✅ Code complete |
| Phase 3 | MCP notification tool server | ✅ Code complete |
| Phase 4 | LangGraph orchestrator | ✅ Code complete, ⏳ pending .env for verification |
| Phase 5 | FastAPI wrapper | ✅ Code complete, ⏳ pending .env for verification |

## Configuration Blocker

> [!WARNING]
> **`.env` file not pre-populated.** The spec stated env vars would be "already filled in," but the
> `veritrace-bot/` directory was created fresh. A `.env` was copied from `.env.example` with
> placeholder values. **You must fill in real values before running verification:**
>
> ```bash
> # Edit veritrace-bot/.env with:
> GEMINI_API_KEY=<your-real-key>
> DISCORD_WEBHOOK_URL=<your-real-webhook>
> SLACK_WEBHOOK_URL=<your-real-webhook>
> VERITRACE_API_BASE_URL=<your-real-url>  # or http://localhost:8080
> ```
>
> `python check_config.py` returned exit code 1 — all 4 vars missing.

## Assumptions & Stubs

### Phase 2 — Backend endpoint paths (ASSUMED)
The following REST paths are **assumed based on conventions** — confirm against the real Rust (actix-web) API:

| Tool | Assumed endpoint |
|------|-----------------|
| `check_duplicate` | `GET /check-duplicate?hash={file_hash}` |
| `get_verification_status` | `GET /verify/{content_id}` |
| `get_similar_matches` | `GET /similar-matches/{content_id}` |

**Manual follow-up needed:** Compare these paths with the actual Rust API source and adjust `mcp-backend/server.py` if different.

### Phase 2/3 — Backend likely unreachable
The VeriTrace Rust/Go backend is an external service. Tool calls to it will return `{"error": "backend_unreachable", ...}` unless the backend is running locally or the correct URL is configured.

## Dependency Note
`pip install` produced a warning: `langchain 0.3.27 requires langchain-core<1.0.0,>=0.3.72, but you have langchain-core 1.4.9 which is incompatible.` This is a conflict with a pre-existing `langchain` package, not used by this project. Our direct dependencies (`langchain-core`, `langchain-google-genai`, `langchain-mcp-adapters`, `langgraph`) all installed successfully.

## Verification Results

### Scaffold
- ✅ All project files created (23 files across 6 directories)
- ✅ `requirements.txt` installed successfully
- ❌ `check_config.py` — FAILED (no .env with real values)

### Phase 1 — RAG Docs + Ingestion
- ✅ 6 documentation files written (150-400 words each, real content)
- ✅ `rag/ingest.py` — code complete (chunking by ## headings, text-embedding-004, ChromaDB)
- ✅ `rag/retrieve.py` — code complete (query embedding + top-k retrieval)
- ⏳ `python rag/ingest.py` — blocked on GEMINI_API_KEY
- ⏳ `python rag/ingest.py --rebuild` — blocked on GEMINI_API_KEY
- ⏳ Retrieval test ("pHash threshold") — blocked on GEMINI_API_KEY

### Phase 2 — MCP Backend Tool Server
- ✅ `mcp-backend/server.py` — 3 tools: `check_duplicate`, `get_verification_status`, `get_similar_matches`
- ✅ Connection error handling → structured JSON error, no crashes
- ⚠️ Endpoint paths assumed (see Assumptions section)

### Phase 3 — MCP Notification Tool Server
- ✅ `mcp-notify/server.py` — 2 tools: `notify_discord`, `notify_slack`
- ✅ Webhook URL validation (returns error if not configured)
- ⏳ Live webhook test — blocked on real webhook URLs in .env

### Phase 4 — LangGraph Orchestrator
- ✅ `orchestrator/graph.py` — StateGraph with agent/tools loop
  - RAG tool (`retrieve_docs`) wrapping rag/retrieve.py
  - MCP tools loaded via `MultiServerMCPClient` (stdio transport)
  - `ChatGoogleGenerativeAI` with model from `GEMINI_MODEL` env var
  - 429 retry with exponential backoff (1s, 2s, 4s)
  - `recursion_limit=8` safeguard with graceful fallback
  - `MemorySaver` checkpointer for per-session conversation history via `thread_id`
  - `run_turn(session_id, user_message) → {"reply": ...}`
- ✅ `orchestrator/main.py` — CLI loop calling `run_turn()` with fixed session_id

#### Phase 4 Test Cases (⏳ blocked on .env)

| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | "How does the matching threshold work?" | retrieve_docs only, no MCP | ⏳ |
| 2 | "Was file X flagged as a duplicate?" | backend tool called | ⏳ |
| 3 | "Let the team know this one's flagged" | notify tool called | ⏳ |
| 4 | Follow-up referencing prior context | resolves via thread_id | ⏳ |
| 5 | Multi-step chain (check → match → notify) | 3 tools in sequence | ⏳ |
| 6 | Out-of-scope question | graceful "not covered" | ⏳ |
| 7 | Backend unreachable | clean fallback message | ⏳ |

### Phase 5 — FastAPI Wrapper
- ✅ `api/main.py` — POST /chat, GET /health, CORS *, startup init
- ✅ `api/Dockerfile` — Python 3.11-slim, uvicorn on port 8000
- ⏳ Live HTTP test — blocked on .env

## Notes

- **MemorySaver**: In-process memory — resets on restart, not multi-instance safe. For persistence, swap to `SqliteSaver` (LangGraph supports this without changing graph logic). Flagged as fast follow-up.
- **CORS**: Set to `*` for hackathon simplicity. Lock down before real deployment.
- **Model config**: `GEMINI_MODEL` env var defaults to `gemini-2.5-flash-lite`. Set to `gemini-2.5-flash` for demo.

## Next Steps — To Complete Verification

1. Fill in `veritrace-bot/.env` with real values
2. Run `python check_config.py` → confirm all OK
3. Run `python rag/ingest.py` → verify embedding + ChromaDB storage
4. Run `python rag/retrieve.py "what is the pHash threshold"` → verify retrieval
5. Run `python orchestrator/main.py` → run all 7 test cases
6. Start `uvicorn api.main:app --reload` → test POST /chat and GET /health
7. Update this file with pass/fail for every test
