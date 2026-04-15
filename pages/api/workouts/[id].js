const { withAuth } = require("../../../lib/withAuth");
const { getDb } = require("../../../lib/db");

async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();
  const { id } = req.query;
  try {
    const db = await getDb();
    const workout = await db.findById("workouts", id);
    if (!workout || workout.user_id != req.user.id) return res.status(404).json({ error: "Workout not found" });
    await db.delete("workouts", id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export default withAuth(handler);
