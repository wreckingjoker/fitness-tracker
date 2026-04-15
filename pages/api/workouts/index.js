const { withAuth } = require("../../../lib/withAuth");
const { getDb } = require("../../../lib/db");

async function handler(req, res) {
  const db = await getDb();

  if (req.method === "GET") {
    try {
      const today = new Date().toISOString().split("T")[0];
      const all = await db.findWhere("workouts", (r) => r.user_id == req.user.id && String(r.logged_at || "").startsWith(today));
      return res.json(all.sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at)));
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  if (req.method === "POST") {
    const { exercise, sets, reps, weight_kg, notes } = req.body;
    if (!exercise || !sets || !reps) return res.status(400).json({ error: "exercise, sets, reps required" });
    try {
      const entry = await db.insert("workouts", {
        user_id: req.user.id,
        exercise, sets, reps,
        weight_kg: weight_kg || "",
        notes: notes || "",
        logged_at: new Date().toISOString(),
      });
      return res.json(entry);
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  res.status(405).end();
}

export default withAuth(handler);
