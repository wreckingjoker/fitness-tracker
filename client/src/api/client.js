import axios from "axios";

const api = axios.create({ baseURL: "/" });

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data);

export const getProfile = () =>
  api.get("/auth/profile").then((r) => r.data);

// ── Daily Log ─────────────────────────────────────────
export const getDailyLog = () =>
  api.get("/dailylog/today").then((r) => r.data);

export const getDailyLogHistory = (days = 30) =>
  api.get(`/dailylog/history?days=${days}`).then((r) => r.data);

export const updateWater = (glasses) =>
  api.patch("/dailylog/water", { glasses }).then((r) => r.data);

// ── Meals ─────────────────────────────────────────────
export const getTodayMeals = () =>
  api.get("/meals/today").then((r) => r.data);

export const logMeal = (description, meal_type) =>
  api.post("/meals/log", { description, meal_type }).then((r) => r.data);

export const deleteMeal = (id) =>
  api.delete(`/meals/${id}`).then((r) => r.data);

// ── Progress ──────────────────────────────────────────
export const getProgress = () =>
  api.get("/progress").then((r) => r.data);

export const addProgress = (data) =>
  api.post("/progress", data).then((r) => r.data);

// ── Diet Plan ─────────────────────────────────────────
export const getWeeklyDietPlan = () =>
  api.get("/dietplan/weekly").then((r) => r.data);

// ── Workouts ──────────────────────────────────────────
export const getTodayWorkouts = () =>
  api.get("/workouts").then((r) => r.data);

export const logWorkout = (data) =>
  api.post("/workouts", data).then((r) => r.data);

export const deleteWorkout = (id) =>
  api.delete(`/workouts/${id}`).then((r) => r.data);
