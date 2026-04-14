#!/usr/bin/env bash
# Step 3 — Seed Google Sheets with user profile + Kerala food data
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

cd "$ROOT/server"
node services/seedSheets.js

echo ""
echo "Done. Open your Google Spreadsheet to verify the data."
echo "Then run: tools/03_dev_start.sh"
