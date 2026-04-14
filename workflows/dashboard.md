# Workflow: Dashboard

## Objective
Render today's nutrition summary, meal list, and progress snapshot.

## Data flow on mount
1. `GET /dailylog/today` → stat cards (calories, protein, carbs, fat) + water tracker
2. `GET /meals/today` → meal list (grouped by meal_type)
3. `GET /progress` (last 7) → mini weight chart

## Key rules
- Macro bars: width = `Math.min((actual / target) * 100, 100)` — never overflow
- Calories deficit = `target_kcal - total_kcal` (shown as "remaining" or "over")
- Water glasses tracked via PATCH /dailylog/water
- Streak = client-side count of consecutive days with ≥1 meal logged
