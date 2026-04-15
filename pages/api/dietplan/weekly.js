const { generateDietPlan } = require("../../../lib/geminiService");

const USER_PROFILE = {
  age: 23, gender: "male", height_cm: 175, weight_kg: 68.5,
  goal: "lose_belly_fat", target_kcal: 1850,
  protein_target_g: 150, carbs_target_g: 200, fat_target_g: 55,
};

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const result = await generateDietPlan(USER_PROFILE);
    if (!result.success) return res.status(500).json({ error: result.error || "Failed to generate plan" });
    res.json(result.plan);
  } catch (err) { res.status(500).json({ error: err.message }); }
}
