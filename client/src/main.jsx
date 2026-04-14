import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MealLogger from "./pages/MealLogger";
import Progress from "./pages/Progress";
import DietPlan from "./pages/DietPlan";
import Workouts from "./pages/Workouts";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen bg-slate-50 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={
          <RequireAuth>
            <AppLayout><Dashboard /></AppLayout>
          </RequireAuth>
        } />
        <Route path="/log" element={
          <RequireAuth>
            <AppLayout><MealLogger /></AppLayout>
          </RequireAuth>
        } />
        <Route path="/progress" element={
          <RequireAuth>
            <AppLayout><Progress /></AppLayout>
          </RequireAuth>
        } />
        <Route path="/diet-plan" element={
          <RequireAuth>
            <AppLayout><DietPlan /></AppLayout>
          </RequireAuth>
        } />
        <Route path="/workouts" element={
          <RequireAuth>
            <AppLayout><Workouts /></AppLayout>
          </RequireAuth>
        } />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
