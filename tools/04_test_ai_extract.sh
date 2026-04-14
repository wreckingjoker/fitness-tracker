#!/usr/bin/env bash
# Test the Gemini nutrition extraction endpoint
# Usage: bash tools/04_test_ai_extract.sh

curl -s -X POST http://localhost:4000/nutrition/extract \
  -H "Content-Type: application/json" \
  -d '{"description": "had 3 puttu with kadala curry and a cup of black tea"}' \
  | python3 -m json.tool
