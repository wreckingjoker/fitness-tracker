import Link from "next/link";
import { useRouter } from "next/router";

const links = [
  { to: "/dashboard", label: "Home", icon: "📊" },
  { to: "/log", label: "Log", icon: "🍽️" },
  { to: "/diet-plan", label: "Plan", icon: "📋" },
  { to: "/progress", label: "Progress", icon: "📈" },
  { to: "/workouts", label: "Gym", icon: "💪" },
];

export default function BottomNav() {
  const router = useRouter();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <div className="flex">
        {links.map(({ to, label, icon }) => {
          const isActive = router.pathname === to;
          return (
            <Link
              key={to}
              href={to}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? "text-green-600" : "text-gray-400"
              }`}
            >
              <span className={`text-lg leading-none ${isActive ? "" : "opacity-60"}`}>{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
