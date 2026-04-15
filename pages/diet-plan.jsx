import { useState } from "react";
const getWeeklyDietPlan = () => fetch("/api/dietplan/weekly").then((r) => r.json());

const MEAL_LABELS = { breakfast: "🌅 Breakfast", lunch: "☀️ Lunch", dinner: "🌙 Dinner", snack: "🥜 Snack" };

export default function DietPlan() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlan = async () => {
    setLoading(true);
    setError(null);
    try { setPlan(await getWeeklyDietPlan()); }
    catch (err) { setError(err.response?.data?.error || err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Diet Plan</h2>
          <p className="text-gray-400 text-sm mt-1">AI-generated Kerala meal plan · 1850 kcal/day</p>
        </div>
        <button
          onClick={fetchPlan}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
        >
          {loading ? "Generating..." : plan ? "Regenerate" : "Generate Plan"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-600 text-sm">{error}</div>
      )}

      {!plan && !loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-14 text-center shadow-sm">
          <p className="text-4xl mb-4">🥥</p>
          <p className="text-gray-500 mb-1">No plan generated yet.</p>
          <p className="text-gray-400 text-sm">Click "Generate Plan" to get a personalised 7-day Kerala meal plan.</p>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-14 text-center shadow-sm">
          <p className="text-gray-400 animate-pulse text-sm">Gemini is crafting your Kerala diet plan...</p>
        </div>
      )}

      {plan?.days && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {plan.days.map((day) => (
            <div key={day.day} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{day.day}</h3>
                <span className="text-xs bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-full border border-green-100">
                  {day.total_kcal} kcal
                </span>
              </div>
              <div className="space-y-3">
                {["breakfast", "lunch", "dinner", "snack"].map((type) => {
                  const meal = day[type];
                  if (!meal) return null;
                  return (
                    <div key={type}>
                      <p className="text-xs text-gray-400 mb-0.5">{MEAL_LABELS[type]}</p>
                      <p className="text-sm text-gray-700">{meal.meal}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {meal.kcal} kcal · P:{meal.protein_g}g · C:{meal.carbs_g}g
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
