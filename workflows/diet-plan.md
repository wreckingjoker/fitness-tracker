# Workflow: Diet Plan Generator

## Objective
Generate a personalized 7-day Kerala meal plan using Gemini.

## Flow
1. User visits `/diet-plan`
2. `GET /dietplan/weekly` called on mount
3. Server calls Gemini with user profile (1850 kcal, 150g protein, Kerala cuisine)
4. Gemini returns structured JSON: `{ days: [{ day, breakfast, lunch, dinner, total_kcal }] }`
5. Frontend renders 7-day grid with per-meal macro summaries

## Gemini prompt (in dietplan route)
System: "You are a Kerala diet planner. Return ONLY valid JSON — no markdown."
User: "Generate a 7-day meal plan for a 23-year-old male, 175cm, 68.5kg. Target: 1850 kcal/day,
150g protein, 200g carbs, 55g fat. Use traditional Kerala foods for all meals."
