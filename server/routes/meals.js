const express = require("express");
const { db } = require("../services/sheetsDb");
const { extractNutrition } = require("../services/geminiService");
const { fallbackExtract } = require("../services/keralaFoodFallback");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

function todayStr() {
  return new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
}

// POST /meals/log
router.post("/log", authMiddleware, async (req, res) => {
  const { description, meal_type } = req.body;
  if (!description || !meal_type)
    return res.status(400).json({ error: "description and meal_type required" });

  const user_id = req.user.id;

  let extracted = await extractNutrition(description);
  if (!extracted.success) {
    console.warn("Gemini failed — using fallback");
    extracted = fallbackExtract(description);
  }
  const { items, totals } = extracted;

  try {
    const meal = await db.insert("meals", {
      user_id,
      meal_type,
      description,
      items: JSON.stringify(items),
      total_kcal: Math.round(totals.calories),
      protein_g: totals.protein_g,
      carbs_g: totals.carbs_g,
      fat_g: totals.fat_g,
      fiber_g: totals.fiber_g,
      logged_at: new Date().toISOString(),
    });

    // Upsert daily log
    const today = todayStr();
    const existing = (await db.findWhere("daily_log", (r) => r.user_id == user_id && String(r.date) === today))[0];
    if (existing) {
      await db.update("daily_log", existing.id, {
        total_kcal: (existing.total_kcal || 0) + Math.round(totals.calories),
        total_protein_g: (existing.total_protein_g || 0) + totals.protein_g,
        total_carbs_g: (existing.total_carbs_g || 0) + totals.carbs_g,
        total_fat_g: (existing.total_fat_g || 0) + totals.fat_g,
        total_fiber_g: (existing.total_fiber_g || 0) + totals.fiber_g,
      });
    } else {
      await db.insert("daily_log", {
        user_id, date: today,
        total_kcal: Math.round(totals.calories),
        total_protein_g: totals.protein_g,
        total_carbs_g: totals.carbs_g,
        total_fat_g: totals.fat_g,
        total_fiber_g: totals.fiber_g,
        water_glasses: 0,
      });
    }

    res.json({ meal: { ...meal, items }, totals, source: extracted.source || "gemini" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /meals/today
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const today = todayStr();
    const meals = await db.findWhere(
      "meals",
      (r) => r.user_id == req.user.id && String(r.logged_at).startsWith(today)
    );
    res.json(meals.map((m) => ({ ...m, items: safeParseJSON(m.items) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /meals/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const meal = await db.findById("meals", id);
    if (!meal || meal.user_id != req.user.id)
      return res.status(404).json({ error: "Meal not found" });

    await db.delete("meals", id);

    // Subtract from daily log
    const today = todayStr();
    const logRows = await db.findWhere("daily_log", (r) => r.user_id == req.user.id && String(r.date) === today);
    if (logRows[0]) {
      const log = logRows[0];
      await db.update("daily_log", log.id, {
        total_kcal: Math.max(0, (log.total_kcal || 0) - (meal.total_kcal || 0)),
        total_protein_g: Math.max(0, (log.total_protein_g || 0) - (meal.protein_g || 0)),
        total_carbs_g: Math.max(0, (log.total_carbs_g || 0) - (meal.carbs_g || 0)),
        total_fat_g: Math.max(0, (log.total_fat_g || 0) - (meal.fat_g || 0)),
        total_fiber_g: Math.max(0, (log.total_fiber_g || 0) - (meal.fiber_g || 0)),
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function safeParseJSON(str) {
  try { return JSON.parse(str || "[]"); } catch { return []; }
}

module.exports = router;
