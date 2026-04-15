import { useState } from "react";
import { addMeal } from "../lib/store";
import { useDailyLog } from "../hooks/useDailyLog";
import MealCard from "../components/MealCard";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export default function MealLogger() {
  const { meals, refetch } = useDailyLog();
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Extraction failed");

      const meal = addMeal({
        meal_type: mealType,
        description: description.trim(),
        items: data.items,
        total_kcal: Math.round(data.totals.calories),
        protein_g: data.totals.protein_g,
        carbs_g: data.totals.carbs_g,
        fat_g: data.totals.fat_g,
        fiber_g: data.totals.fiber_g,
      });

      setResult({ meal, totals: data.totals });
      setDescription("");
      refetch();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Log a Meal</h2>
      <p className="text-gray-400 text-sm mb-6">Type what you ate — Gemini extracts the nutrition automatically.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Meal Type</label>
          <div className="flex gap-2 flex-wrap">
            {MEAL_TYPES.map((t) => (
              <button type="button" key={t} onClick={() => setMealType(t)}
                className={`px-4 py-2 rounded-lg text-sm capitalize font-medium transition-colors cursor-pointer ${
                  mealType === t ? "bg-green-500 text-white" : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">What did you eat?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 3 puttu with kadala curry and a cup of black tea"
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>

        <button type="submit" disabled={loading || !description.trim()}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer">
          {loading ? "Extracting nutrition with Gemini..." : "Log Meal"}
        </button>

        {error && <p className="text-red-600 text-sm mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}
      </form>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-green-700 mb-3">✓ Logged — {Math.round(result.totals?.calories)} kcal</h3>
          <div className="space-y-1 mb-3">
            {result.meal?.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name} <span className="text-gray-400">({item.quantity})</span></span>
                <span className="text-gray-500">{item.calories} kcal</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-center pt-3 border-t border-green-200">
            <div><span className="text-blue-600 font-semibold">{Math.round(result.totals?.protein_g)}g</span><br /><span className="text-gray-400">Protein</span></div>
            <div><span className="text-orange-500 font-semibold">{Math.round(result.totals?.carbs_g)}g</span><br /><span className="text-gray-400">Carbs</span></div>
            <div><span className="text-purple-600 font-semibold">{Math.round(result.totals?.fat_g)}g</span><br /><span className="text-gray-400">Fat</span></div>
          </div>
        </div>
      )}

      {meals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Today's meals</h3>
          <div className="space-y-3">
            {meals.map((meal) => <MealCard key={meal.id} meal={meal} onDelete={refetch} />)}
          </div>
        </div>
      )}
    </div>
  );
}
