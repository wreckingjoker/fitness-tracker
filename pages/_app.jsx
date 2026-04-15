import dynamic from "next/dynamic";
import "../styles/globals.css";

const Sidebar = dynamic(() => import("../components/Sidebar"), { ssr: false });
const BottomNav = dynamic(() => import("../components/BottomNav"), { ssr: false });

export default function App({ Component, pageProps }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-60 min-h-screen bg-slate-50 p-4 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
        <Component {...pageProps} />
      </main>
      <BottomNav />
    </div>
  );
}
