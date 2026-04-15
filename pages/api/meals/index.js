const { withAuth } = require("../../../lib/withAuth");
const { getDb } = require("../../../lib/db");
const { extractNutrition } = require("../../../lib/geminiService");
const { fallbackExtract } = require("../../../lib/keralaFoodFallback");

function todayStr() { return new Date().toISOString().split("T")[0]; }

async function handler(req, res) {
  const db = await getDb();

  if (req.method === "GET") {
    try {
      const today = todayStr();
      const meals = await db.findWhere(
        "meals",
        (r) => r.user_id == req.user.id && String(r.logged_at).startsWith(today)
      );
      return res.json(meals.map((m) => ({ ...m, items: safeParseJSON(m.items) })));
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  if (req.method === "POST") {
    const { description, meal_type } = req.body;
    if (!description || !meal_type) return res.status(400).json({ error: "description and meal_type required" });
    let extracted = await extractNutrition(description);
    if (!extracted.success) extracted = fallbackExtract(description);
    const { items, totals } = extracted;
    try {
      const meal = await db.insert("meals", {
        user_id: req.user.id, meal_type, description,
        items: JSON.stringify(items),
        total_kcal: Math.round(totals.calories),
        protein_g: totals.protein_g, carbs_g: totals.carbs_g,
        fat_g: totals.fat_g, fiber_g: totals.fiber_g,
        logged_at: new Date().toISOString(),
      });
      const today = todayStr();
      const existing = (await db.findWhere("daily_log", (r) => r.user_id == req.user.id && String(r.date) === today))[0];
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
          user_id: req.user.id, date: today,
          total_kcal: Math.round(totals.calories),
          total_protein_g: totals.protein_g, total_carbs_g: totals.carbs_g,
          total_fat_g: totals.fat_g, total_fiber_g: totals.fiber_g, water_glasses: 0,
        });
      }
      return res.json({ meal: { ...meal, items }, totals, source: extracted.source || "gemini" });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  res.status(405).end();
}

function safeParseJSON(str) { try { return JSON.parse(str || "[]"); } catch { return []; } }

export default withAuth(handler);
