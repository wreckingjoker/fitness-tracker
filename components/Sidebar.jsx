import Link from "next/link";
import { useRouter } from "next/router";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/log", label: "Log Meal", icon: "🍽️" },
  { to: "/diet-plan", label: "Diet Plan", icon: "📋" },
  { to: "/progress", label: "Progress", icon: "📈" },
  { to: "/workouts", label: "Workouts", icon: "💪" },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-white border-r border-slate-100 flex flex-col z-20 shadow-sm">
      <div className="p-5 bg-gradient-to-br from-green-500 to-green-600">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-base">🥥</div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">FitTrack Kerala</h1>
            <p className="text-xs text-green-100 mt-0.5">1850 kcal / day</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">S</div>
          <div>
            <p className="text-xs font-semibold text-gray-700">Shon</p>
            <p className="text-xs text-gray-400">Reduce belly fat</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, label, icon }) => {
          const isActive = router.pathname === to;
          return (
            <Link
              key={to}
              href={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-green-50 text-green-700 shadow-sm"
                  : "text-gray-500 hover:bg-slate-50 hover:text-gray-800"
              }`}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>68.5 kg · 175 cm · 23 yrs</span>
        </div>
        <button
          onClick={() => { localStorage.removeItem("token"); router.push("/login"); }}
          className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer text-left py-1"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}
