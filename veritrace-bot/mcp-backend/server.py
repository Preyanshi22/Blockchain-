import os
import json
import requests
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

BASE_URL = os.getenv('VERITRACE_API_BASE_URL', 'http://localhost:8080').rstrip('/')

mcp_server = FastMCP('veritrace-backend')

@mcp_server.tool()
def check_duplicate(file_hash: str) -> str:
    """Check if a file with the given SHA-256 hash already exists in VeriTrace's registry. Returns duplicate status and metadata if found."""
    try:
        resp = requests.get(f'{BASE_URL}/check-duplicate', params={'hash': file_hash}, timeout=10)
        resp.raise_for_status()
        return json.dumps(resp.json())
    except requests.ConnectionError:
        return json.dumps({'error': 'backend_unreachable', 'message': f'Could not connect to VeriTrace backend at {BASE_URL}'})
    except requests.RequestException as e:
        return json.dumps({'error': 'request_failed', 'message': str(e)})

@mcp_server.tool()
def get_verification_status(content_id: str) -> str:
    """Get the full verification status for a piece of content by its content ID. Returns exact match info and similar matches ranked by similarity."""
    try:
        resp = requests.get(f'{BASE_URL}/verify/{content_id}', timeout=10)
        resp.raise_for_status()
        return json.dumps(resp.json())
    except requests.ConnectionError:
        return json.dumps({'error': 'backend_unreachable', 'message': f'Could not connect to VeriTrace backend at {BASE_URL}'})
    except requests.RequestException as e:
        return json.dumps({'error': 'request_failed', 'message': str(e)})

@mcp_server.tool()
def get_similar_matches(content_id: str) -> str:
    """Get all perceptually similar content matches for a given content ID. Returns matches ranked by similarity percentage (highest first), using pHash with Hamming distance threshold of 40."""
    try:
        resp = requests.get(f'{BASE_URL}/similar-matches/{content_id}', params={'content_id': content_id}, timeout=10)
        resp.raise_for_status()
        return json.dumps(resp.json())
    except requests.ConnectionError:
        return json.dumps({'error': 'backend_unreachable', 'message': f'Could not connect to VeriTrace backend at {BASE_URL}'})
    except requests.RequestException as e:
        return json.dumps({'error': 'request_failed', 'message': str(e)})

if __name__ == '__main__':
    mcp_server.run(transport='stdio')
