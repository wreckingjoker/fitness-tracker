const express = require("express");
const { db } = require("../services/sheetsDb");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// GET /workouts
router.get("/", authMiddleware, async (req, res) => {
  try {
    const today = todayStr();
    const all = await db.findWhere(
      "workouts",
      (r) => r.user_id == req.user.id && String(r.logged_at).startsWith(today)
    );
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /workouts
router.post("/", authMiddleware, async (req, res) => {
  const { exercise, sets, reps, weight_kg, notes } = req.body;
  if (!exercise || !sets || !reps)
    return res.status(400).json({ error: "exercise, sets, reps required" });
  try {
    const w = await db.insert("workouts", {
      user_id: req.user.id, exercise,
      sets, reps,
      weight_kg: weight_kg || "",
      notes: notes || "",
      logged_at: new Date().toISOString(),
    });
    res.json(w);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /workouts/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const w = await db.findById("workouts", req.params.id);
    if (!w || w.user_id != req.user.id) return res.status(404).json({ error: "Not found" });
    await db.delete("workouts", req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
