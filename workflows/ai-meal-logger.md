# Workflow: AI Meal Logger

## Objective
Log a meal in plain English and have Gemini extract nutrition data automatically.

## Flow
1. User types meal in `MealLogger.jsx` input (e.g., "3 puttu with kadala curry")
2. Frontend `POST /meals/log` → `{ description, meal_type, user_id: 1 }`
3. `meals.js` route calls `geminiService.extractNutrition(description)`
4. Gemini returns JSON array of items with calories, protein, carbs, fat, fiber
5. Server saves `Meal` record + upserts `DailyLog` totals for today
6. Frontend refetches `/dailylog/today` and `/meals/today` → dashboard updates

## Fallback
If Gemini fails, `keralaFoodFallback.js` fuzzy-matches keywords in the description
against the local 30-food Kerala food database.

## Test
Run `bash tools/04_test_ai_extract.sh` while the server is running.
