/**
 * Offline fallback for Kerala food nutrition lookup.
 * Used when Gemini API is unavailable.
 */

const KERALA_FOODS = [
  { name: "puttu", keywords: ["puttu"], kcal: 180, protein_g: 4, carbs_g: 38, fat_g: 1, fiber_g: 2, serving: "1 piece" },
  { name: "appam", keywords: ["appam", "palappam"], kcal: 120, protein_g: 2, carbs_g: 25, fat_g: 1, fiber_g: 0.5, serving: "1 piece" },
  { name: "idiyappam", keywords: ["idiyappam", "string hopper"], kcal: 140, protein_g: 2.5, carbs_g: 30, fat_g: 0.5, fiber_g: 1, serving: "2 pieces" },
  { name: "pathiri", keywords: ["pathiri"], kcal: 110, protein_g: 2, carbs_g: 24, fat_g: 0.5, fiber_g: 0.5, serving: "1 piece" },
  { name: "dosa", keywords: ["dosa", "dosai"], kcal: 160, protein_g: 4, carbs_g: 30, fat_g: 3, fiber_g: 1, serving: "1 piece" },
  { name: "idli", keywords: ["idli"], kcal: 70, protein_g: 2, carbs_g: 14, fat_g: 0.5, fiber_g: 0.5, serving: "1 piece" },
  { name: "parotta", keywords: ["parotta", "porotta"], kcal: 210, protein_g: 4, carbs_g: 35, fat_g: 7, fiber_g: 1, serving: "1 piece" },
  { name: "rice", keywords: ["rice", "choru"], kcal: 200, protein_g: 4, carbs_g: 44, fat_g: 0.5, fiber_g: 0.6, serving: "1 cup" },
  { name: "kadala curry", keywords: ["kadala", "chickpea"], kcal: 220, protein_g: 10, carbs_g: 30, fat_g: 6, fiber_g: 8, serving: "1 cup" },
  { name: "fish curry", keywords: ["fish curry", "meen curry"], kcal: 180, protein_g: 22, carbs_g: 4, fat_g: 8, fiber_g: 0, serving: "1 piece" },
  { name: "beef fry", keywords: ["beef", "ularthiyathu"], kcal: 280, protein_g: 25, carbs_g: 5, fat_g: 18, fiber_g: 1, serving: "100g" },
  { name: "chicken curry", keywords: ["chicken"], kcal: 200, protein_g: 22, carbs_g: 6, fat_g: 10, fiber_g: 1, serving: "1 serving" },
  { name: "egg roast", keywords: ["egg", "mutta"], kcal: 160, protein_g: 12, carbs_g: 5, fat_g: 11, fiber_g: 1, serving: "2 eggs" },
  { name: "sambar", keywords: ["sambar"], kcal: 90, protein_g: 4, carbs_g: 14, fat_g: 2, fiber_g: 3, serving: "1 cup" },
  { name: "avial", keywords: ["avial"], kcal: 130, protein_g: 3, carbs_g: 15, fat_g: 7, fiber_g: 4, serving: "1 cup" },
  { name: "thoran", keywords: ["thoran"], kcal: 80, protein_g: 2, carbs_g: 10, fat_g: 4, fiber_g: 3, serving: "1 serving" },
  { name: "pazham pori", keywords: ["pazham pori", "banana fritter"], kcal: 180, protein_g: 2, carbs_g: 28, fat_g: 7, fiber_g: 1.5, serving: "2 pieces" },
  { name: "banana", keywords: ["banana", "pazham"], kcal: 110, protein_g: 1.5, carbs_g: 28, fat_g: 0.5, fiber_g: 3, serving: "1 medium" },
  { name: "tea", keywords: ["tea", "chai", "sulaimani"], kcal: 15, protein_g: 0, carbs_g: 4, fat_g: 0, fiber_g: 0, serving: "1 cup" },
  { name: "dal", keywords: ["dal", "parippu", "lentil"], kcal: 150, protein_g: 9, carbs_g: 22, fat_g: 3, fiber_g: 5, serving: "1 cup" },
];

/**
 * Fuzzy-match a description against known Kerala foods.
 * Returns an array of matched food items with estimated quantities.
 */
function fallbackExtract(description) {
  const lower = description.toLowerCase();
  const items = [];

  for (const food of KERALA_FOODS) {
    const matched = food.keywords.some((kw) => lower.includes(kw));
    if (!matched) continue;

    // Try to detect a quantity prefix (e.g. "3 puttu", "2 appam")
    let qty = 1;
    for (const kw of food.keywords) {
      const match = lower.match(new RegExp(`(\\d+)\\s+${kw}`));
      if (match) { qty = parseInt(match[1], 10); break; }
    }

    items.push({
      name: food.name,
      quantity: `${qty} ${food.serving}`,
      calories: food.kcal * qty,
      protein_g: food.protein_g * qty,
      carbs_g: food.carbs_g * qty,
      fat_g: food.fat_g * qty,
      fiber_g: food.fiber_g * qty,
    });
  }

  if (items.length === 0) {
    // Generic estimate for unrecognized food
    items.push({
      name: description.substring(0, 50),
      quantity: "1 serving",
      calories: 250,
      protein_g: 10,
      carbs_g: 30,
      fat_g: 8,
      fiber_g: 2,
    });
  }

  const totals = items.reduce(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      protein_g: acc.protein_g + i.protein_g,
      carbs_g: acc.carbs_g + i.carbs_g,
      fat_g: acc.fat_g + i.fat_g,
      fiber_g: acc.fiber_g + i.fiber_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
  );

  return { items, totals, success: true, source: "fallback" };
}

module.exports = { fallbackExtract };
