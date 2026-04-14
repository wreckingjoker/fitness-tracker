import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { getProgress, addProgress, getDailyLogHistory } from "../api/client";

const TOOLTIP_STYLE = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  fontSize: "12px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function Progress() {
  const [entries, setEntries] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ weight_kg: "", waist_cm: "", hip_cm: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("body"); // "body" | "nutrition"

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prog, hist] = await Promise.all([
        getProgress().catch(() => []),
        getDailyLogHistory(30).catch(() => []),
      ]);
      setEntries(Array.isArray(prog) ? prog.reverse() : []);
      setHistory(Array.isArray(hist) ? hist : []);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.weight_kg && !form.waist_cm) return;
    setSaving(true);
    try {
      await addProgress({
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        waist_cm: form.waist_cm ? parseFloat(form.waist_cm) : undefined,
        hip_cm: form.hip_cm ? parseFloat(form.hip_cm) : undefined,
        notes: form.notes || undefined,
      });
      setForm({ weight_kg: "", waist_cm: "", hip_cm: "", notes: "" });
      fetchAll();
    } finally { setSaving(false); }
  };

  // Chart data for body measurements
  const bodyChartData = [...entries].reverse().map((e) => ({
    date: formatDate(e.recorded_at),
    weight: e.weight_kg ? parseFloat(e.weight_kg) : null,
    waist: e.waist_cm ? parseFloat(e.waist_cm) : null,
  }));

  // Chart data for nutrition history
  const nutritionChartData = history.map((h) => ({
    date: formatDate(h.date),
    calories: parseInt(h.total_kcal) || 0,
    protein: parseFloat(h.total_protein_g) || 0,
    carbs: parseFloat(h.total_carbs_g) || 0,
    fat: parseFloat(h.total_fat_g) || 0,
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Progress Tracker</h2>
        <p className="text-gray-400 text-sm mt-0.5">Track your body measurements and nutrition history</p>
      </div>

      {loading && <div className="text-center py-8 text-gray-400 text-sm animate-pulse">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm mb-4">{error}</div>}

      {/* Log measurement form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Log Body Measurement</h3>
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            { key: "weight_kg", label: "Weight (kg)", placeholder: "68.5" },
            { key: "waist_cm", label: "Waist (cm)", placeholder: "82" },
            { key: "hip_cm", label: "Hip (cm)", placeholder: "90" },
            { key: "notes", label: "Notes", placeholder: "Optional" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
              <input
                type={key === "notes" ? "text" : "number"}
                step="0.1"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={saving || (!form.weight_kg && !form.waist_cm)}
          className="bg-green-500 hover:bg-green-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
        >
          {saving ? "Saving..." : "Save Measurement"}
        </button>
      </form>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { id: "body", label: "Body Measurements" },
          { id: "nutrition", label: "Nutrition History" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Body measurements tab */}
      {activeTab === "body" && (
        <>
          {bodyChartData.length > 1 ? (
            <div className="space-y-4 mb-6">
              {/* Weight chart */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Weight (kg)</h3>
                <p className="text-xs text-gray-400 mb-4">{bodyChartData.length} entries</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={bodyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={["auto", "auto"]} width={40} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: "#22c55e", r: 4 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Waist chart */}
              {bodyChartData.some((d) => d.waist) && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Waist (cm)</h3>
                  <p className="text-xs text-gray-400 mb-4">Lower is better</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={bodyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={["auto", "auto"]} width={40} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Line type="monotone" dataKey="waist" name="Waist (cm)" stroke="#f97316" strokeWidth={2.5} dot={{ fill: "#f97316", r: 4 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm mb-6">
              <p className="text-2xl mb-2">📏</p>
              <p className="text-gray-500 text-sm">Log at least 2 measurements to see your trend chart</p>
            </div>
          )}

          {/* History table */}
          {entries.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Measurement History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-slate-100">
                      <th className="pb-2.5 font-medium">Date</th>
                      <th className="pb-2.5 font-medium">Weight</th>
                      <th className="pb-2.5 font-medium">Waist</th>
                      <th className="pb-2.5 font-medium">Hip</th>
                      <th className="pb-2.5 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[...entries].reverse().map((e) => (
                      <tr key={e.id} className="text-gray-600 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5">{new Date(e.recorded_at).toLocaleDateString("en-IN")}</td>
                        <td className="py-2.5 font-medium text-green-600">{e.weight_kg ? `${e.weight_kg} kg` : "—"}</td>
                        <td className="py-2.5">{e.waist_cm ? `${e.waist_cm} cm` : "—"}</td>
                        <td className="py-2.5">{e.hip_cm ? `${e.hip_cm} cm` : "—"}</td>
                        <td className="py-2.5 text-gray-400 text-xs">{e.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && entries.length === 0 && (
            <p className="text-gray-400 text-center py-10 text-sm">No measurements yet. Log your first one above.</p>
          )}
        </>
      )}

      {/* Nutrition history tab */}
      {activeTab === "nutrition" && (
        <>
          {nutritionChartData.length > 0 ? (
            <div className="space-y-4">
              {/* Calorie bar chart */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-800">Daily Calories</h3>
                  <span className="text-xs text-gray-400">Last {nutritionChartData.length} days</span>
                </div>
                <p className="text-xs text-gray-400 mb-4">Target: 1850 kcal/day</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={nutritionChartData} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} width={45} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} kcal`, "Calories"]} />
                    <ReferenceLine y={1850} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Target", fill: "#22c55e", fontSize: 11, position: "right" }} />
                    <Bar dataKey="calories" name="Calories" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Macro trend lines */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Macro Trends</h3>
                <p className="text-xs text-gray-400 mb-4">Protein · Carbs · Fat per day</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={nutritionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} width={35} unit="g" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, name) => [`${Math.round(v)}g`, name]} />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                    <Line type="monotone" dataKey="protein" name="Protein" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="carbs" name="Carbs" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="fat" name="Fat" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Daily nutrition table */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Daily Log History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-slate-100">
                        <th className="pb-2.5 font-medium">Date</th>
                        <th className="pb-2.5 font-medium">Calories</th>
                        <th className="pb-2.5 font-medium">Protein</th>
                        <th className="pb-2.5 font-medium">Carbs</th>
                        <th className="pb-2.5 font-medium">Fat</th>
                        <th className="pb-2.5 font-medium">Water</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[...history].reverse().map((h) => {
                        const kcal = parseInt(h.total_kcal) || 0;
                        const isOver = kcal > 1850;
                        return (
                          <tr key={h.id} className="text-gray-600 hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 font-medium">{formatDate(h.date)}</td>
                            <td className={`py-2.5 font-semibold ${isOver ? "text-red-500" : "text-green-600"}`}>{kcal}</td>
                            <td className="py-2.5 text-blue-600">{Math.round(parseFloat(h.total_protein_g) || 0)}g</td>
                            <td className="py-2.5 text-orange-500">{Math.round(parseFloat(h.total_carbs_g) || 0)}g</td>
                            <td className="py-2.5 text-purple-600">{Math.round(parseFloat(h.total_fat_g) || 0)}g</td>
                            <td className="py-2.5 text-gray-400">{h.water_glasses || 0}/8 💧</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <p className="text-3xl mb-3">📊</p>
              <p className="text-gray-600 text-sm font-medium">No nutrition history yet</p>
              <p className="text-gray-400 text-xs mt-1">Start logging meals to see your daily nutrition trend here</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
