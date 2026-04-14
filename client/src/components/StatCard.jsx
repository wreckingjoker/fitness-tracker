export default function StatCard({ label, value, unit, sub, color = "green" }) {
  const topBorder = {
    green: "border-t-green-500",
    blue: "border-t-blue-500",
    orange: "border-t-orange-400",
    purple: "border-t-purple-500",
    red: "border-t-red-500",
  };
  const valueColor = {
    green: "text-green-600",
    blue: "text-blue-600",
    orange: "text-orange-500",
    purple: "text-purple-600",
    red: "text-red-500",
  };
  const bgAccent = {
    green: "bg-green-50",
    blue: "bg-blue-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
    red: "bg-red-50",
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 border-t-4 ${topBorder[color]} p-5 shadow-sm`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex items-end gap-1.5">
        <span className={`text-3xl font-bold ${valueColor[color]}`}>{value ?? "—"}</span>
        {unit && <span className="text-sm text-gray-400 mb-1">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}
    </div>
  );
}
