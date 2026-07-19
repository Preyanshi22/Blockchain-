"""
VeriTrace RAG — Document Ingestion Pipeline

Reads Markdown docs from docs/, chunks them by ## headings,
embeds with Google text-embedding-004, and stores in ChromaDB.
"""

import os
import sys
import glob
import re

from dotenv import load_dotenv
import chromadb
import google.genai as genai

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_DIR = os.path.join(PROJECT_ROOT, "docs")
CHROMA_DB_PATH = os.path.join(PROJECT_ROOT, "chroma_db")
COLLECTION_NAME = "veritrace_docs"

# Load environment variables from project-root .env
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

# ---------------------------------------------------------------------------
# Chunking helpers
# ---------------------------------------------------------------------------
MAX_CHUNK_TOKENS = 500  # approximate token budget per chunk


def _estimate_tokens(text: str) -> int:
    """Rough token estimate (1 token ≈ 4 chars)."""
    return len(text) // 4


def _split_at_paragraphs(text: str, max_tokens: int = MAX_CHUNK_TOKENS) -> list[str]:
    """Split *text* into smaller pieces at paragraph (blank-line) boundaries."""
    paragraphs = re.split(r"\n{2,}", text)
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for para in paragraphs:
        para_tokens = _estimate_tokens(para)
        if current and (current_len + para_tokens) > max_tokens:
            chunks.append("\n\n".join(current).strip())
            current = [para]
            current_len = para_tokens
        else:
            current.append(para)
            current_len += para_tokens

    if current:
        chunks.append("\n\n".join(current).strip())

    return [c for c in chunks if c]


def chunk_markdown(text: str) -> list[str]:
    """
    Split a Markdown document into chunks at ``## `` heading boundaries.

    * Content before the first ``##`` becomes its own chunk (including any
      top-level ``# `` title).
    * Any chunk exceeding ~500 tokens is further split at paragraph boundaries.
    """
    sections = re.split(r"(?m)^(## .+)$", text)

    raw_chunks: list[str] = []

    # sections[0] is everything before the first ## heading
    preamble = sections[0].strip()
    if preamble:
        raw_chunks.append(preamble)

    # Remaining elements alternate: heading, body, heading, body, …
    i = 1
    while i < len(sections):
        heading = sections[i]
        body = sections[i + 1] if i + 1 < len(sections) else ""
        raw_chunks.append(f"{heading}\n{body}".strip())
        i += 2

    # Sub-split oversized chunks
    final_chunks: list[str] = []
    for chunk in raw_chunks:
        if _estimate_tokens(chunk) > MAX_CHUNK_TOKENS:
            final_chunks.extend(_split_at_paragraphs(chunk))
        else:
            final_chunks.append(chunk)

    return final_chunks


# ---------------------------------------------------------------------------
# Embedding helper
# ---------------------------------------------------------------------------

def embed_texts(texts: list[str], client: genai.Client) -> list[list[float]]:
    """Return embedding vectors for a list of texts (one call per text)."""
    vectors: list[list[float]] = []
    for text in texts:
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
        )
        vectors.append(result.embeddings[0].values)
    return vectors


# ---------------------------------------------------------------------------
# Main ingestion logic
# ---------------------------------------------------------------------------

def ingest(rebuild: bool = False) -> None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not set. Add it to your .env file.")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    # -- Discover docs --
    md_files = sorted(glob.glob(os.path.join(DOCS_DIR, "*.md")))
    if not md_files:
        print(f"No .md files found in {DOCS_DIR}")
        return
    print(f"[DOCS] Found {len(md_files)} document(s) in docs/")

    # -- Chunk --
    all_chunks: list[str] = []
    all_ids: list[str] = []
    all_metas: list[dict] = []

    for filepath in md_files:
        filename = os.path.basename(filepath)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        chunks = chunk_markdown(content)
        for idx, chunk in enumerate(chunks):
            all_chunks.append(chunk)
            all_ids.append(f"{filename}::chunk{idx}")
            all_metas.append({"source": filename, "chunk_index": idx})

    print(f"[CHUNK] Created {len(all_chunks)} chunk(s) from {len(md_files)} document(s)")

    # -- ChromaDB setup --
    chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)

    if rebuild:
        # Wipe existing collection
        try:
            chroma_client.delete_collection(COLLECTION_NAME)
            print("[REBUILD] Existing collection wiped.")
        except Exception:
            pass  # collection didn't exist yet

    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    # -- Embed & store --
    print("[EMBED] Embedding chunks with text-embedding-004...")
    vectors = embed_texts(all_chunks, client)
    print(f"[OK] Embedded {len(vectors)} chunk(s)")

    collection.upsert(
        ids=all_ids,
        embeddings=vectors,
        documents=all_chunks,
        metadatas=all_metas,
    )
    print(f"[STORED] {len(vectors)} chunk(s) saved to ChromaDB at {CHROMA_DB_PATH}")


# ---------------------------------------------------------------------------
# CLI entry-point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    rebuild_flag = "--rebuild" in sys.argv
    ingest(rebuild=rebuild_flag)
