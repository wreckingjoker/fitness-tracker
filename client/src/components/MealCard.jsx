import { deleteMeal } from "../api/client";

const MEAL_ICONS = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🥜" };
const MEAL_COLORS = {
  breakfast: "bg-amber-50 text-amber-700",
  lunch: "bg-orange-50 text-orange-700",
  dinner: "bg-blue-50 text-blue-700",
  snack: "bg-purple-50 text-purple-700",
};

export default function MealCard({ meal, onDelete }) {
  const handleDelete = async () => {
    if (!confirm("Remove this meal?")) return;
    await deleteMeal(meal.id);
    onDelete?.();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex justify-between items-start group shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3 flex-1 min-w-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${MEAL_COLORS[meal.meal_type] || "bg-gray-50 text-gray-500"}`}>
          {MEAL_ICONS[meal.meal_type] || "🍽️"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-gray-600 capitalize">{meal.meal_type}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">
              {new Date(meal.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className="text-sm text-gray-700 truncate leading-snug">{meal.description}</p>
          <div className="flex gap-3 text-xs mt-1.5">
            <span className="font-semibold text-green-600">{meal.total_kcal} kcal</span>
            <span className="text-gray-400">P {Math.round(meal.protein_g)}g</span>
            <span className="text-gray-400">C {Math.round(meal.carbs_g)}g</span>
            <span className="text-gray-400">F {Math.round(meal.fat_g)}g</span>
          </div>
        </div>
      </div>
      <button
        onClick={handleDelete}
        className="ml-3 w-6 h-6 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 text-lg leading-none flex items-center justify-center cursor-pointer flex-shrink-0"
        title="Delete meal"
      >
        ×
      </button>
    </div>
  );
}
