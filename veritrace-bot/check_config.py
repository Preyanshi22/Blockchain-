#!/usr/bin/env python3
"""Validate that all required environment variables are present and non-empty."""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

REQUIRED_VARS = [
    'GEMINI_API_KEY',
    'DISCORD_WEBHOOK_URL',
    'SLACK_WEBHOOK_URL',
    'VERITRACE_API_BASE_URL',
]

def main():
    missing = []
    for var in REQUIRED_VARS:
        value = os.getenv(var, '').strip()
        if not value:
            missing.append(var)
            print(f'  MISSING: {var}')
        else:
            # Mask sensitive values
            display = value[:8] + '...' if len(value) > 12 else '(set)'
            print(f'  OK: {var} = {display}')

    if missing:
        print(f'\nFAILED: {len(missing)} required variable(s) not set.')
        print('Copy .env.example to .env and fill in the values.')
        sys.exit(1)
    else:
        print('\nAll required environment variables are set.')
        sys.exit(0)

if __name__ == '__main__':
    print('VeriTrace Bot — Configuration Check')
    print('=' * 40)
    main()
