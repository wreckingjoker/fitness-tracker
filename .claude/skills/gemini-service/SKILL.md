---
name: gemini-service
description: Use when implementing or fixing the Gemini nutrition extraction service, wiring the AI meal logger, setting up the Gemini API, or updating geminiService.js.
argument-hint: [service to implement or fix]
---

## What This Skill Does

Generates or repairs the Gemini API-powered nutrition extraction service (`server/services/geminiService.js`) and its route (`server/routes/nutrition.js`) for the FitTrack Kerala project.

## Context

- AI engine: `gemini-1.5-flash` (free tier, ~1500 requests/day)
- SDK: `@google/generative-ai` (install: `npm install @google/generative-ai`)
- API key env var: `GEMINI_API_KEY` stored in `server/.env`
- Full service spec is in [CLAUDE.md](../../../../claude.md) under "Core Service — Gemini API Meal Extractor"
- Fallback logic lives in `server/services/keralaFoodFallback.js`

## Steps

1. Read `claude.md` at the project root to confirm the current `geminiService.js` spec.
2. Read `server/services/geminiService.js` if it already exists — understand what's there before changing anything.
3. Implement or update `server/services/geminiService.js` exactly as specified in CLAUDE.md:
   - Use `GoogleGenerativeAI` from `@google/generative-ai`
   - Model: `gemini-1.5-flash`
   - Pass `systemInstruction` at model init time (not in the message)
   - Strip markdown code fences from response before `JSON.parse`
   - Export: `{ extractNutrition }`
4. Verify `server/routes/nutrition.js` imports `geminiService` (not `claudeService`) and calls `extractNutrition(description)`.
5. If `$ARGUMENTS` mentions a specific issue (e.g., "JSON parse error", "rate limit"), diagnose and fix that specific problem. Consult the error recovery workflow in CLAUDE.md.
6. Remind the user: `GEMINI_API_KEY` must be set in `server/.env`. Free key at https://aistudio.google.com/apikey

## Output

- Updated `server/services/geminiService.js`
- Updated `server/routes/nutrition.js` (if wiring is needed)
- Console note if `npm install @google/generative-ai` hasn't been run yet

## Notes

- Gemini may wrap JSON in ` ```json ... ``` ` even when told not to. The strip regex handles this — do not remove it.
- Rate limit on free tier: 15 requests/min, ~1500/day on gemini-1.5-flash. This is sufficient for personal use.
- If `$ARGUMENTS` is empty, default to implementing the full service from scratch.
- Do NOT hardcode the API key — always read from `process.env.GEMINI_API_KEY`.
