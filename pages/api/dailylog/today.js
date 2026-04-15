const { withAuth } = require("../../../lib/withAuth");
const { getDb } = require("../../../lib/db");

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const db = await getDb();
    const today = new Date().toISOString().split("T")[0];
    const logs = await db.findWhere("daily_log", (r) => r.user_id == req.user.id && String(r.date) === today);
    const log = logs[0] || null;
    const user = await db.findById("users", req.user.id);
    const targets = user ? {
      target_kcal: user.target_kcal, protein_target_g: user.protein_target_g,
      carbs_target_g: user.carbs_target_g, fat_target_g: user.fat_target_g,
      fiber_target_g: user.fiber_target_g, water_target: user.water_target,
    } : {};
    res.json({
      total_kcal: log?.total_kcal || 0, total_protein_g: log?.total_protein_g || 0,
      total_carbs_g: log?.total_carbs_g || 0, total_fat_g: log?.total_fat_g || 0,
      total_fiber_g: log?.total_fiber_g || 0, water_glasses: log?.water_glasses || 0, targets,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export default withAuth(handler);
