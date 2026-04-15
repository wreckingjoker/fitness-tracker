const { extractNutrition } = require("../../lib/geminiService");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: "description required" });
  try {
    const result = await extractNutrition(description);
    if (!result.success) return res.status(500).json({ error: result.error || "Extraction failed" });
    res.json({ items: result.items, totals: result.totals });
  } catch (err) { res.status(500).json({ error: err.message }); }
}
