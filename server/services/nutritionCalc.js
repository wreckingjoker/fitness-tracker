/**
 * Calculate TDEE using Mifflin-St Jeor equation.
 * @param {{ weight_kg, height_cm, age, gender, activity_level }} profile
 */
function calcTDEE({ weight_kg, height_cm, age, gender, activity_level }) {
  const bmr =
    gender === "male"
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
      : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;

  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  return Math.round(bmr * (multipliers[activity_level] || 1.55));
}

/**
 * Sum nutrition totals from an array of meal items.
 */
function sumTotals(items) {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein_g: acc.protein_g + (item.protein_g || 0),
      carbs_g: acc.carbs_g + (item.carbs_g || 0),
      fat_g: acc.fat_g + (item.fat_g || 0),
      fiber_g: acc.fiber_g + (item.fiber_g || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
  );
}

/**
 * Calculate calorie deficit (negative = surplus).
 */
function calcDeficit(target_kcal, consumed_kcal) {
  return target_kcal - consumed_kcal;
}

module.exports = { calcTDEE, sumTotals, calcDeficit };
