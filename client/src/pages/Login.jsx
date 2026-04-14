import { useState } from "react";
import { login } from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("shon@fittrack.local");
  const [password, setPassword] = useState("fittrack123");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await login(email, password);
      localStorage.setItem("token", token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-slate-50 to-emerald-50">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-green-200">
            🥥
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FitTrack Kerala</h1>
          <p className="text-gray-500 text-sm mt-1">Personal diet & gym tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-green-200 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Logged in as <span className="font-medium text-gray-500">Shon</span> · 68.5 kg · Goal: Reduce belly fat
        </p>
      </div>
    </div>
  );
}
