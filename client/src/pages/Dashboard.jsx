import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useDailyLog } from "../hooks/useDailyLog";
import { getDailyLogHistory } from "../api/client";
import StatCard from "../components/StatCard";
import MacroBar from "../components/MacroBar";
import MealCard from "../components/MealCard";
import WaterTracker from "../components/WaterTracker";

function CalorieRing({ current, target }) {
  const pct = Math.min((current / target) * 100, 100);
  const r = 50;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const remaining = target - current;
  const isOver = current > target;

  return (
    <div className="flex flex-col items-center">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#f1f5f9" strokeWidth="11" />
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={isOver ? "#ef4444" : "#22c55e"} strokeWidth="11"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="65" y="59" textAnchor="middle" fill="#111827" fontSize="22" fontWeight="700">{current}</text>
        <text x="65" y="74" textAnchor="middle" fill="#9ca3af" fontSize="10">kcal eaten</text>
      </svg>
      <p className={`text-xs font-medium mt-1 ${isOver ? "text-red-500" : "text-green-600"}`}>
        {remaining >= 0 ? `${remaining} left` : `${Math.abs(remaining)} over`}
      </p>
      <p className="text-xs text-gray-400">of {target} kcal</p>
    </div>
  );
}

export default function Dashboard() {
  const { log, meals, loading, error, refetch, setWater } = useDailyLog();
  const [weekHistory, setWeekHistory] = useState([]);

  useEffect(() => {
    getDailyLogHistory(7)
      .then((data) => setWeekHistory(Array.isArray(data) ? data : []))
      .catch(() => setWeekHistory([]));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm animate-pulse">Loading dashboard...</div>
  );
  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">Error: {error}</div>
  );

  const targets = log?.targets || {};
  const kcalTarget = targets.target_kcal || 1850;
  const remaining = kcalTarget - (log?.total_kcal || 0);

  const mealsByType = (meals || []).reduce((acc, m) => {
    if (!acc[m.meal_type]) acc[m.meal_type] = [];
    acc[m.meal_type].push(m);
    return acc;
  }, {});

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">{greeting}, Shon 👋</h2>
        <p className="text-gray-400 text-sm mt-0.5">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Stats row: Calorie ring + 3 macro cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Calorie card */}
        <div className="bg-white rounded-2xl border border-slate-100 border-t-4 border-t-green-500 p-5 shadow-sm flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 self-start">Calories</p>
          <CalorieRing current={log?.total_kcal || 0} target={kcalTarget} />
        </div>
        <StatCard label="Protein" value={Math.round(log?.total_protein_g || 0)} unit="g" sub={`Target: ${targets.protein_target_g || 150}g`} color="blue" />
        <StatCard label="Carbs" value={Math.round(log?.total_carbs_g || 0)} unit="g" sub={`Target: ${targets.carbs_target_g || 200}g`} color="orange" />
        <StatCard label="Fat" value={Math.round(log?.total_fat_g || 0)} unit="g" sub={`Target: ${targets.fat_target_g || 55}g`} color="purple" />
      </div>

      {/* Bottom: Macros/Water + Meals */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left col: Macro bars + water */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-5">Macro Breakdown</h3>
            <MacroBar label="Calories" current={log?.total_kcal || 0} target={kcalTarget} unit="kcal" color="green" />
            <MacroBar label="Protein" current={log?.total_protein_g || 0} target={targets.protein_target_g || 150} color="blue" />
            <MacroBar label="Carbs" current={log?.total_carbs_g || 0} target={targets.carbs_target_g || 200} color="orange" />
            <MacroBar label="Fat" current={log?.total_fat_g || 0} target={targets.fat_target_g || 55} color="purple" />
            <MacroBar label="Fiber" current={log?.total_fiber_g || 0} target={targets.fiber_target_g || 30} color="green" />
          </div>
          <WaterTracker glasses={log?.water_glasses || 0} target={targets.water_target || 8} onToggle={setWater} />
        </div>

        {/* Right col: Today's meals */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Today's Meals</h3>
            <a href="/log" className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors">+ Log meal</a>
          </div>

          {meals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <p className="text-3xl mb-3">🍛</p>
              <p className="text-gray-600 text-sm font-medium">No meals logged today</p>
              <p className="text-gray-400 text-xs mt-1 mb-4">Start by logging your breakfast</p>
              <a
                href="/log"
                className="inline-block bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Log a meal
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {["breakfast", "lunch", "dinner", "snack"].map((type) =>
                mealsByType[type]?.map((meal) => (
                  <MealCard key={meal.id} meal={meal} onDelete={refetch} />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Weekly calorie trend */}
      {weekHistory.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-800">7-Day Calorie Trend</h3>
            <a href="/progress" className="text-xs text-green-600 hover:text-green-700 font-medium">View full history →</a>
          </div>
          <p className="text-xs text-gray-400 mb-4">Daily intake vs 1850 kcal target</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weekHistory.map((h) => ({
              date: new Date(h.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
              calories: parseInt(h.total_kcal) || 0,
            }))} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} width={40} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "12px" }}
                formatter={(v) => [`${v} kcal`, "Calories"]}
              />
              <ReferenceLine y={kcalTarget} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1.5} />
              <Bar dataKey="calories" fill="#bbf7d0" radius={[4, 4, 0, 0]}
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
