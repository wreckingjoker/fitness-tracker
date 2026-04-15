export default function WaterTracker({ glasses, target = 8, onToggle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Water</p>
        <span className="text-sm font-bold text-blue-600">
          {glasses}<span className="text-gray-400 font-normal">/{target}</span>
        </span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: target }).map((_, i) => (
          <button
            key={i}
            onClick={() => onToggle(i < glasses ? i : i + 1)}
            className={`text-xl transition-all hover:scale-110 cursor-pointer select-none ${
              i < glasses ? "opacity-100 drop-shadow-sm" : "opacity-20"
            }`}
            title={`Set to ${i + 1} glass${i > 0 ? "es" : ""}`}
          >
            💧
          </button>
        ))}
      </div>
      {glasses > 0 && (
        <p className="text-xs text-blue-500 mt-2 font-medium">
          {glasses >= target ? "Daily target reached! 🎉" : `${target - glasses} more to go`}
        </p>
      )}
    </div>
  );
}
