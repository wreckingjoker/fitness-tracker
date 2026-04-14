const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const NUTRITION_SYSTEM = `
You are a nutrition expert specializing in Kerala cuisine and Indian food.
When given a meal description, extract each food item and return ONLY a valid JSON array.
No preamble, no markdown code fences, no explanation — only the raw JSON array.

Each item in the array must have:
- name: string (exact food name)
- quantity: string (e.g. "3 pieces", "1 cup", "200g")
- calories: number (kcal)
- protein_g: number
- carbs_g: number
- fat_g: number
- fiber_g: number

Use Kerala home-cooking standard portions. Examples:
- 1 puttu = 180 kcal, 4g protein, 38g carbs, 1g fat, 2g fiber
- 1 appam = 120 kcal, 2g protein, 25g carbs, 1g fat, 0.5g fiber
- 1 cup kadala curry = 220 kcal, 10g protein, 30g carbs, 6g fat, 8g fiber
- 1 cup rice = 200 kcal, 4g protein, 44g carbs, 0.5g fat, 0.6g fiber
- 1 piece fish curry (Kerala style) = 180 kcal, 22g protein, 4g carbs, 8g fat, 0g fiber
- 1 parotta = 210 kcal, 4g protein, 35g carbs, 7g fat, 1g fiber
- 1 cup sambar = 90 kcal, 4g protein, 14g carbs, 2g fat, 3g fiber

If unsure, use conservative estimates. Always return valid JSON with no surrounding text.
`.trim();

const DIETPLAN_SYSTEM = `
You are a Kerala diet planner and nutrition expert.
Return ONLY valid JSON — no markdown fences, no explanation.
`.trim();

async function extractNutrition(mealDescription) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: NUTRITION_SYSTEM,
    });

    const result = await model.generateContent(mealDescription);
    const raw = result.response.text().trim();
    const jsonStr = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const items = JSON.parse(jsonStr);

    const totals = items.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein_g: acc.protein_g + (item.protein_g || 0),
        carbs_g: acc.carbs_g + (item.carbs_g || 0),
        fat_g: acc.fat_g + (item.fat_g || 0),
        fiber_g: acc.fiber_g + (item.fiber_g || 0),
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
    );

    return { items, totals, success: true };
  } catch (err) {
    console.error("Gemini extraction error:", err.message);
    return { items: [], totals: null, success: false, error: err.message };
  }
}

async function generateDietPlan(userProfile) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: DIETPLAN_SYSTEM,
    });

    const prompt = `Generate a 7-day Kerala meal plan for:
- Age: ${userProfile.age}, Gender: ${userProfile.gender}
- Height: ${userProfile.height_cm}cm, Weight: ${userProfile.weight_kg}kg
- Goal: ${userProfile.goal}
- Daily targets: ${userProfile.target_kcal} kcal, ${userProfile.protein_target_g}g protein, ${userProfile.carbs_target_g}g carbs, ${userProfile.fat_target_g}g fat

Return this exact JSON structure:
{
  "days": [
    {
      "day": "Monday",
      "breakfast": { "meal": "...", "kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0 },
      "lunch": { "meal": "...", "kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0 },
      "dinner": { "meal": "...", "kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0 },
      "snack": { "meal": "...", "kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0 },
      "total_kcal": 0
    }
  ]
}

Use traditional Kerala foods. Vary meals across all 7 days.`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const jsonStr = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    return { plan: JSON.parse(jsonStr), success: true };
  } catch (err) {
    console.error("Gemini diet plan error:", err.message);
    return { plan: null, success: false, error: err.message };
  }
}

module.exports = { extractNutrition, generateDietPlan };
