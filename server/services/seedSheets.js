/**
 * Seeds the Google Sheets database with:
 * - Ahmed's user profile (email: ahmed@fittrack.local / password: fittrack123)
 * - 30 Kerala foods
 *
 * Run: node server/services/seedSheets.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const { db } = require("./sheetsDb");

const KERALA_FOODS = [
  { name: "puttu", alias: "rice puttu", kcal_per: 180, protein_g: 4, carbs_g: 38, fat_g: 1, fiber_g: 2, serving: "1 piece (80g)" },
  { name: "appam", alias: "palappam", kcal_per: 120, protein_g: 2, carbs_g: 25, fat_g: 1, fiber_g: 0.5, serving: "1 piece (60g)" },
  { name: "idiyappam", alias: "string hoppers", kcal_per: 140, protein_g: 2.5, carbs_g: 30, fat_g: 0.5, fiber_g: 1, serving: "2 pieces (70g)" },
  { name: "pathiri", alias: "rice roti", kcal_per: 110, protein_g: 2, carbs_g: 24, fat_g: 0.5, fiber_g: 0.5, serving: "1 piece (50g)" },
  { name: "dosa", alias: "dosai", kcal_per: 160, protein_g: 4, carbs_g: 30, fat_g: 3, fiber_g: 1, serving: "1 piece (80g)" },
  { name: "idli", alias: "", kcal_per: 70, protein_g: 2, carbs_g: 14, fat_g: 0.5, fiber_g: 0.5, serving: "1 piece (50g)" },
  { name: "parotta", alias: "porotta", kcal_per: 210, protein_g: 4, carbs_g: 35, fat_g: 7, fiber_g: 1, serving: "1 piece (80g)" },
  { name: "rice", alias: "cooked rice", kcal_per: 200, protein_g: 4, carbs_g: 44, fat_g: 0.5, fiber_g: 0.6, serving: "1 cup (185g)" },
  { name: "kanji", alias: "rice gruel", kcal_per: 90, protein_g: 2, carbs_g: 19, fat_g: 0.5, fiber_g: 0.5, serving: "1 cup (240ml)" },
  { name: "kadala curry", alias: "black chickpea curry", kcal_per: 220, protein_g: 10, carbs_g: 30, fat_g: 6, fiber_g: 8, serving: "1 cup (200g)" },
  { name: "fish curry", alias: "meen curry", kcal_per: 180, protein_g: 22, carbs_g: 4, fat_g: 8, fiber_g: 0, serving: "1 piece with gravy (150g)" },
  { name: "beef fry", alias: "beef ularthiyathu", kcal_per: 280, protein_g: 25, carbs_g: 5, fat_g: 18, fiber_g: 1, serving: "100g" },
  { name: "chicken curry", alias: "", kcal_per: 200, protein_g: 22, carbs_g: 6, fat_g: 10, fiber_g: 1, serving: "1 serving (150g)" },
  { name: "egg roast", alias: "mutta roast", kcal_per: 160, protein_g: 12, carbs_g: 5, fat_g: 11, fiber_g: 1, serving: "2 eggs with masala" },
  { name: "sambar", alias: "", kcal_per: 90, protein_g: 4, carbs_g: 14, fat_g: 2, fiber_g: 3, serving: "1 cup (200ml)" },
  { name: "avial", alias: "", kcal_per: 130, protein_g: 3, carbs_g: 15, fat_g: 7, fiber_g: 4, serving: "1 cup (150g)" },
  { name: "thoran", alias: "stir fry vegetable", kcal_per: 80, protein_g: 2, carbs_g: 10, fat_g: 4, fiber_g: 3, serving: "1 serving (100g)" },
  { name: "olan", alias: "", kcal_per: 100, protein_g: 2, carbs_g: 12, fat_g: 5, fiber_g: 3, serving: "1 cup (200g)" },
  { name: "mezhukkupuratti", alias: "stir fried vegetables", kcal_per: 90, protein_g: 2, carbs_g: 12, fat_g: 4, fiber_g: 2.5, serving: "1 serving (100g)" },
  { name: "pazham pori", alias: "banana fritter", kcal_per: 180, protein_g: 2, carbs_g: 28, fat_g: 7, fiber_g: 1.5, serving: "2 pieces (80g)" },
  { name: "unniyappam", alias: "", kcal_per: 90, protein_g: 1.5, carbs_g: 16, fat_g: 2.5, fiber_g: 0.5, serving: "1 piece (35g)" },
  { name: "banana", alias: "Kerala banana", kcal_per: 110, protein_g: 1.5, carbs_g: 28, fat_g: 0.5, fiber_g: 3, serving: "1 medium (120g)" },
  { name: "coconut chutney", alias: "", kcal_per: 80, protein_g: 1, carbs_g: 4, fat_g: 7, fiber_g: 2, serving: "2 tbsp (30g)" },
  { name: "sulaimani tea", alias: "black lemon tea", kcal_per: 15, protein_g: 0, carbs_g: 4, fat_g: 0, fiber_g: 0, serving: "1 cup (200ml)" },
  { name: "coconut milk", alias: "", kcal_per: 120, protein_g: 1, carbs_g: 3, fat_g: 12, fiber_g: 0, serving: "100ml" },
  { name: "fish fry", alias: "meen fry", kcal_per: 200, protein_g: 24, carbs_g: 5, fat_g: 10, fiber_g: 0, serving: "1 piece (100g)" },
  { name: "prawn curry", alias: "chemmeen curry", kcal_per: 170, protein_g: 18, carbs_g: 6, fat_g: 8, fiber_g: 1, serving: "1 serving (150g)" },
  { name: "dal", alias: "parippu", kcal_per: 150, protein_g: 9, carbs_g: 22, fat_g: 3, fiber_g: 5, serving: "1 cup (200g)" },
  { name: "chakka curry", alias: "jackfruit curry", kcal_per: 130, protein_g: 2, carbs_g: 26, fat_g: 3, fiber_g: 3, serving: "1 cup (200g)" },
  { name: "payasam", alias: "kheer", kcal_per: 200, protein_g: 4, carbs_g: 35, fat_g: 6, fiber_g: 0.5, serving: "1 cup (200ml)" },
];

async function seed() {
  await db.init();

  // Seed Kerala foods (skip if already present)
  const existingFoods = await db.getAll("kerala_foods");
  const existingNames = new Set(existingFoods.map((f) => f.name));
  let added = 0;
  for (const food of KERALA_FOODS) {
    if (!existingNames.has(food.name)) {
      await db.insert("kerala_foods", food);
      added++;
    }
  }
  console.log(`Kerala foods: ${added} added, ${existingFoods.length} already existed.`);

  // Seed user (skip if email already exists)
  const existing = await db.findWhere("users", (r) => r.email === "ahmed@fittrack.local");
  if (existing.length === 0) {
    const password = await bcrypt.hash("fittrack123", 10);
    await db.insert("users", {
      name: "Shon",
      email: "shon@fittrack.local",
      password,
      age: 23, gender: "male", height_cm: 175, weight_kg: 68.5,
      goal: "lose_belly_fat", activity_level: "moderately_active",
      tdee_kcal: 2200, target_kcal: 1850,
      protein_target_g: 150, carbs_target_g: 200, fat_target_g: 55,
      fiber_target_g: 30, water_target: 8, cuisine: "kerala",
      created_at: new Date().toISOString(),
    });
    console.log("User seeded: shon@fittrack.local / fittrack123");
  } else {
    console.log("User already exists — skipped.");
  }
}

seed().catch((e) => { console.error(e); process.exit(1); });
