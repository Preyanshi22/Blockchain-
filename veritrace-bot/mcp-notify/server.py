import os
import json
import requests
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DISCORD_WEBHOOK = os.getenv('DISCORD_WEBHOOK_URL', '')
SLACK_WEBHOOK = os.getenv('SLACK_WEBHOOK_URL', '')

mcp_server = FastMCP('veritrace-notify')

@mcp_server.tool()
def notify_discord(message: str) -> str:
    """Send a notification message to the VeriTrace team's Discord channel. Use this when the user wants to alert or notify the team about something (e.g., a flagged duplicate, a verification result)."""
    if not DISCORD_WEBHOOK:
        return json.dumps({'success': False, 'error': 'DISCORD_WEBHOOK_URL not configured'})
    try:
        resp = requests.post(DISCORD_WEBHOOK, json={'content': message}, timeout=10)
        resp.raise_for_status()
        return json.dumps({'success': True})
    except requests.RequestException as e:
        return json.dumps({'success': False, 'error': str(e)})

@mcp_server.tool()
def notify_slack(message: str) -> str:
    """Send a notification message to the VeriTrace team's Slack channel. Use this when the user wants to alert or notify the team about something (e.g., a flagged duplicate, a verification result)."""
    if not SLACK_WEBHOOK:
        return json.dumps({'success': False, 'error': 'SLACK_WEBHOOK_URL not configured'})
    try:
        resp = requests.post(SLACK_WEBHOOK, json={'text': message}, timeout=10)
        resp.raise_for_status()
        return json.dumps({'success': True})
    except requests.RequestException as e:
        return json.dumps({'success': False, 'error': str(e)})

if __name__ == '__main__':
    mcp_server.run(transport='stdio')
