const express = require("express");
const { extractNutrition } = require("../services/geminiService");
const { fallbackExtract } = require("../services/keralaFoodFallback");

const router = express.Router();

// POST /nutrition/extract  — standalone extraction (no DB write, used for testing)
router.post("/extract", async (req, res) => {
  const { description } = req.body;
  if (!description)
    return res.status(400).json({ error: "description required" });

  let result = await extractNutrition(description);
  if (!result.success) {
    result = fallbackExtract(description);
  }

  res.json(result);
});

module.exports = router;
