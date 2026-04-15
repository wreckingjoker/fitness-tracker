// All app data stored in localStorage — no database needed.

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function load(key, def) {
  if (typeof window === "undefined") return def;
  try { return JSON.parse(localStorage.getItem(key)) ?? def; }
  catch { return def; }
}

function save(key, val) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

// ── Meals ────────────────────────────────────────────────────────────────────

export function getMeals() {
  return load("ft_meals", []);
}

export function getTodayMeals() {
  const today = new Date().toISOString().split("T")[0];
  return getMeals()
    .filter((m) => String(m.logged_at || "").startsWith(today))
    .sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at));
}

export function addMeal(meal) {
  const meals = getMeals();
  const entry = { ...meal, id: genId(), logged_at: new Date().toISOString() };
  meals.push(entry);
  save("ft_meals", meals);
  return entry;
}

export function deleteMeal(id) {
  save("ft_meals", getMeals().filter((m) => m.id !== id));
}

// ── Daily totals (computed from meals) ───────────────────────────────────────

export function getTodayTotals() {
  const meals = getTodayMeals();
  return {
    total_kcal: Math.round(meals.reduce((s, m) => s + (Number(m.total_kcal) || 0), 0)),
    total_protein_g: Math.round(meals.reduce((s, m) => s + (Number(m.protein_g) || 0), 0) * 10) / 10,
    total_carbs_g: Math.round(meals.reduce((s, m) => s + (Number(m.carbs_g) || 0), 0) * 10) / 10,
    total_fat_g: Math.round(meals.reduce((s, m) => s + (Number(m.fat_g) || 0), 0) * 10) / 10,
    total_fiber_g: Math.round(meals.reduce((s, m) => s + (Number(m.fiber_g) || 0), 0) * 10) / 10,
  };
}

// ── Water ────────────────────────────────────────────────────────────────────

export function getWater() {
  const today = new Date().toISOString().split("T")[0];
  return (load("ft_water", {}))[today] || 0;
}

export function saveWater(glasses) {
  const today = new Date().toISOString().split("T")[0];
  const water = load("ft_water", {});
  water[today] = glasses;
  save("ft_water", water);
}

// ── History ──────────────────────────────────────────────────────────────────

export function getDailyHistory(days = 30) {
  const meals = getMeals();
  const water = load("ft_water", {});
  const byDate = {};

  for (const m of meals) {
    const date = String(m.logged_at || "").split("T")[0];
    if (!date || date.length < 8) continue;
    if (!byDate[date]) byDate[date] = { date, total_kcal: 0, total_protein_g: 0, total_carbs_g: 0, total_fat_g: 0, total_fiber_g: 0, water_glasses: 0 };
    byDate[date].total_kcal += Number(m.total_kcal) || 0;
    byDate[date].total_protein_g += Number(m.protein_g) || 0;
    byDate[date].total_carbs_g += Number(m.carbs_g) || 0;
    byDate[date].total_fat_g += Number(m.fat_g) || 0;
    byDate[date].total_fiber_g += Number(m.fiber_g) || 0;
  }

  for (const [date, glasses] of Object.entries(water)) {
    if (byDate[date]) byDate[date].water_glasses = glasses;
  }

  return Object.values(byDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-days);
}

// ── Progress ─────────────────────────────────────────────────────────────────

export function getProgress() {
  return load("ft_progress", []).sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
}

export function addProgress(entry) {
  const list = load("ft_progress", []);
  const newEntry = { ...entry, id: genId(), recorded_at: new Date().toISOString() };
  list.push(newEntry);
  save("ft_progress", list);
  return newEntry;
}

// ── Workouts ─────────────────────────────────────────────────────────────────

export function getTodayWorkouts() {
  const today = new Date().toISOString().split("T")[0];
  return load("ft_workouts", []).filter((w) => String(w.logged_at || "").startsWith(today));
}

export function addWorkout(entry) {
  const list = load("ft_workouts", []);
  const newEntry = { ...entry, id: genId(), logged_at: new Date().toISOString() };
  list.push(newEntry);
  save("ft_workouts", list);
  return newEntry;
}

export function deleteWorkout(id) {
  save("ft_workouts", load("ft_workouts", []).filter((w) => w.id !== id));
}
