const express = require("express");
const { db } = require("../services/sheetsDb");
const { generateDietPlan } = require("../services/geminiService");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET /dietplan/weekly
router.get("/weekly", authMiddleware, async (req, res) => {
  try {
    const user = await db.findById("users", req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const result = await generateDietPlan(user);
    if (!result.success) return res.status(500).json({ error: result.error });

    res.json(result.plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
