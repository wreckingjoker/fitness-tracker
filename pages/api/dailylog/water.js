const { withAuth } = require("../../../lib/withAuth");
const { getDb } = require("../../../lib/db");

async function handler(req, res) {
  if (req.method !== "PATCH") return res.status(405).end();
  const { glasses } = req.body;
  if (glasses === undefined || glasses < 0) return res.status(400).json({ error: "glasses (≥0) required" });
  try {
    const db = await getDb();
    const today = new Date().toISOString().split("T")[0];
    const logs = await db.findWhere("daily_log", (r) => r.user_id == req.user.id && String(r.date) === today);
    if (logs[0]) {
      await db.update("daily_log", logs[0].id, { water_glasses: glasses });
    } else {
      await db.insert("daily_log", {
        user_id: req.user.id, date: today, water_glasses: glasses,
        total_kcal: 0, total_protein_g: 0, total_carbs_g: 0, total_fat_g: 0, total_fiber_g: 0,
      });
    }
    res.json({ water_glasses: glasses });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export default withAuth(handler);
