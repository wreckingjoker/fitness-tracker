#!/usr/bin/env bash
# Step 2 — Install dependencies for client and server
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

echo "==> Installing server dependencies..."
cd "$ROOT/server"
npm install

echo "==> Installing client dependencies..."
cd "$ROOT/client"
npm install

echo ""
echo "Done. Next: copy .env.example to server/.env and fill in your GEMINI_API_KEY + DATABASE_URL."
echo "Then run: tools/02_db_setup.sh"
