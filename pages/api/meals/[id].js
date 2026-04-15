const { withAuth } = require("../../../lib/withAuth");
const { getDb } = require("../../../lib/db");

function todayStr() { return new Date().toISOString().split("T")[0]; }

async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();
  const { id } = req.query;
  try {
    const db = await getDb();
    const meal = await db.findById("meals", id);
    if (!meal || meal.user_id != req.user.id) return res.status(404).json({ error: "Meal not found" });
    await db.delete("meals", id);
    const today = todayStr();
    const logs = await db.findWhere("daily_log", (r) => r.user_id == req.user.id && String(r.date) === today);
    if (logs[0]) {
      const log = logs[0];
      await db.update("daily_log", log.id, {
        total_kcal: Math.max(0, (log.total_kcal || 0) - (meal.total_kcal || 0)),
        total_protein_g: Math.max(0, (log.total_protein_g || 0) - (meal.protein_g || 0)),
        total_carbs_g: Math.max(0, (log.total_carbs_g || 0) - (meal.carbs_g || 0)),
        total_fat_g: Math.max(0, (log.total_fat_g || 0) - (meal.fat_g || 0)),
        total_fiber_g: Math.max(0, (log.total_fiber_g || 0) - (meal.fiber_g || 0)),
      });
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export default withAuth(handler);
