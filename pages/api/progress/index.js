const { withAuth } = require("../../../lib/withAuth");
const { getDb } = require("../../../lib/db");

async function handler(req, res) {
  const db = await getDb();

  if (req.method === "GET") {
    try {
      const all = await db.findWhere("progress", (r) => r.user_id == req.user.id);
      return res.json(all.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)).slice(0, 30));
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  if (req.method === "POST") {
    const { weight_kg, waist_cm, hip_cm, notes } = req.body;
    if (!weight_kg && !waist_cm) return res.status(400).json({ error: "weight_kg or waist_cm required" });
    try {
      const entry = await db.insert("progress", {
        user_id: req.user.id,
        weight_kg: weight_kg || "", waist_cm: waist_cm || "",
        hip_cm: hip_cm || "", notes: notes || "",
        recorded_at: new Date().toISOString(),
      });
      return res.json(entry);
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  res.status(405).end();
}

export default withAuth(handler);
