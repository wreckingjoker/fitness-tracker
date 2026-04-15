import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar";
import "../styles/globals.css";

const PUBLIC_ROUTES = ["/login"];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isPublic = PUBLIC_ROUTES.includes(router.pathname);
    if (!token && !isPublic) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router.pathname]);

  if (!ready) return null;

  const isPublic = PUBLIC_ROUTES.includes(router.pathname);
  if (isPublic) return <Component {...pageProps} />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen bg-slate-50 p-8 overflow-y-auto">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
