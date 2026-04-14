export default function MacroBar({ label, current, target, unit = "g", color = "green" }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const over = current > target;

  const barColor = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    orange: "bg-orange-400",
    purple: "bg-purple-500",
    red: "bg-red-500",
  };

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className={`text-xs font-semibold ${over ? "text-red-500" : "text-gray-700"}`}>
          {Math.round(current)}<span className="text-gray-400 font-normal">/{target} {unit}</span>
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${over ? "bg-red-400" : barColor[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
