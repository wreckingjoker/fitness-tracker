import { useState, useEffect } from "react";
import { getTodayWorkouts, addWorkout, deleteWorkout } from "../lib/store";

const COMMON_EXERCISES = [
  "Bench Press", "Squat", "Deadlift", "Pull Up", "Push Up",
  "Shoulder Press", "Bicep Curl", "Tricep Dip", "Plank", "Running",
];

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({ exercise: "", sets: "", reps: "", weight_kg: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const fetchWorkouts = () => setWorkouts(getTodayWorkouts());
  useEffect(() => { fetchWorkouts(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.exercise || !form.sets || !form.reps) return;
    setSaving(true);
    addWorkout({
      exercise: form.exercise,
      sets: parseInt(form.sets),
      reps: parseInt(form.reps),
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      notes: form.notes || "",
    });
    setForm({ exercise: "", sets: "", reps: "", weight_kg: "", notes: "" });
    fetchWorkouts();
    setSaving(false);
  };

  const handleDelete = (id) => {
    deleteWorkout(id);
    fetchWorkouts();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Workout Log</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Log Exercise</h3>
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 block mb-1">Exercise</label>
          <input list="exercises" value={form.exercise}
            onChange={(e) => setForm((f) => ({ ...f, exercise: e.target.value }))}
            placeholder="e.g. Bench Press"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          <datalist id="exercises">
            {COMMON_EXERCISES.map((ex) => <option key={ex} value={ex} />)}
          </datalist>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[{ key: "sets", label: "Sets", placeholder: "4" }, { key: "reps", label: "Reps", placeholder: "10" }, { key: "weight_kg", label: "Weight (kg)", placeholder: "60" }].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
              <input type="number" step={key === "weight_kg" ? "0.5" : "1"} value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
          ))}
        </div>
        <div className="mb-5">
          <label className="text-xs font-medium text-gray-500 block mb-1">Notes</label>
          <input type="text" value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Optional"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </div>
        <button type="submit" disabled={saving || !form.exercise || !form.sets || !form.reps}
          className="bg-green-500 hover:bg-green-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer">
          {saving ? "Saving..." : "Log Exercise"}
        </button>
      </form>

      {workouts.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Today's Workout</h3>
          <div className="space-y-2">
            {workouts.map((w) => (
              <div key={w.id} className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between group shadow-sm">
                <div>
                  <p className="font-medium text-sm text-gray-900">{w.exercise}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {w.sets} sets × {w.reps} reps{w.weight_kg ? ` @ ${w.weight_kg}kg` : ""}{w.notes ? ` · ${w.notes}` : ""}
                  </p>
                </div>
                <button onClick={() => handleDelete(w.id)}
                  className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xl cursor-pointer">×</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-center py-10 text-sm">No exercises logged today. Start your workout above!</p>
      )}
    </div>
  );
}
