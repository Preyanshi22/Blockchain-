"""
VeriTrace RAG — Retrieval Module

Embeds a user query with Google text-embedding-004 and retrieves the
top-k most relevant chunks from the ChromaDB collection.
"""

import os
import sys

from dotenv import load_dotenv
import chromadb
import google.genai as genai

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CHROMA_DB_PATH = os.path.join(PROJECT_ROOT, "chroma_db")
COLLECTION_NAME = "veritrace_docs"

# Load environment variables from project-root .env
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))


# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------

def retrieve(query: str, k: int = 4) -> list[dict]:
    """
    Embed *query* and return the top-*k* most similar chunks.

    Returns a list of dicts, each with keys:
        - ``text``   — the chunk content
        - ``source`` — the originating filename
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set. Add it to your .env file.")

    # Embed the query
    client = genai.Client(api_key=api_key)
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=query,
    )
    query_vector = result.embeddings[0].values

    # Query ChromaDB
    chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=k,
    )

    # Build response
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    output: list[dict] = []
    for doc, meta in zip(documents, metadatas):
        output.append({
            "text": doc,
            "source": meta.get("source", "unknown"),
        })

    return output


# ---------------------------------------------------------------------------
# CLI entry-point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m rag.retrieve <query>")
        sys.exit(1)

    query_text = " ".join(sys.argv[1:])
    print(f"[QUERY] {query_text}\n")

    hits = retrieve(query_text)
    if not hits:
        print("No results found. Have you run ingest.py first?")
    else:
        for i, hit in enumerate(hits, 1):
            print(f"--- Result {i} (source: {hit['source']}) ---")
            print(hit["text"][:500])
            print()
