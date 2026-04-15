const { withAuth } = require("../../../lib/withAuth");
const { getDb } = require("../../../lib/db");
const { generateDietPlan } = require("../../../lib/geminiService");

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const db = await getDb();
    const user = await db.findById("users", req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const result = await generateDietPlan(user);
    if (!result.success) return res.status(500).json({ error: result.error || "Failed to generate plan" });
    res.json(result.plan);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export default withAuth(handler);
