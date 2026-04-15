const { withAuth } = require("../../../lib/withAuth");
const { getDb } = require("../../../lib/db");

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const db = await getDb();
    const days = Math.min(parseInt(req.query.days) || 30, 90);
    const meals = await db.findWhere("meals", (r) => r.user_id == req.user.id);
    const byDate = {};
    for (const m of meals) {
      const date = String(m.logged_at || "").split("T")[0];
      if (!date || date.length < 8) continue;
      if (!byDate[date]) byDate[date] = { date, total_kcal: 0, total_protein_g: 0, total_carbs_g: 0, total_fat_g: 0, total_fiber_g: 0, water_glasses: 0 };
      byDate[date].total_kcal += parseFloat(m.total_kcal) || 0;
      byDate[date].total_protein_g += parseFloat(m.protein_g) || 0;
      byDate[date].total_carbs_g += parseFloat(m.carbs_g) || 0;
      byDate[date].total_fat_g += parseFloat(m.fat_g) || 0;
      byDate[date].total_fiber_g += parseFloat(m.fiber_g) || 0;
    }
    for (const d of Object.values(byDate)) {
      d.total_kcal = Math.round(d.total_kcal);
      d.total_protein_g = Math.round(d.total_protein_g * 10) / 10;
      d.total_carbs_g = Math.round(d.total_carbs_g * 10) / 10;
      d.total_fat_g = Math.round(d.total_fat_g * 10) / 10;
    }
    const logs = await db.findWhere("daily_log", (r) => r.user_id == req.user.id);
    for (const log of logs) {
      const date = String(log.date || "").split("T")[0];
      if (byDate[date]) byDate[date].water_glasses = parseInt(log.water_glasses) || 0;
    }
    const sorted = Object.values(byDate).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-days);
    res.json(sorted);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export default withAuth(handler);
