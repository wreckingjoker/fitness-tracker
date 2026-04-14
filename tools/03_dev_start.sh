#!/usr/bin/env bash
# Step 4 — Start client (port 5173) and server (port 4000) concurrently
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

echo "==> Starting FitTrack Kerala dev servers..."
echo "    Client → http://localhost:5173"
echo "    Server → http://localhost:4000"
echo ""

cd "$ROOT/server" && npm run dev &
SERVER_PID=$!

cd "$ROOT/client" && npm run dev &
CLIENT_PID=$!

trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
