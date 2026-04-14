const express = require("express");
const { db } = require("../services/sheetsDb");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET /progress
router.get("/", authMiddleware, async (req, res) => {
  try {
    const all = await db.findWhere("progress", (r) => r.user_id == req.user.id);
    res.json(all.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)).slice(0, 30));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /progress
router.post("/", authMiddleware, async (req, res) => {
  const { weight_kg, waist_cm, hip_cm, notes } = req.body;
  if (!weight_kg && !waist_cm)
    return res.status(400).json({ error: "At least weight_kg or waist_cm required" });
  try {
    const entry = await db.insert("progress", {
      user_id: req.user.id,
      weight_kg: weight_kg || "",
      waist_cm: waist_cm || "",
      hip_cm: hip_cm || "",
      notes: notes || "",
      recorded_at: new Date().toISOString(),
    });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
