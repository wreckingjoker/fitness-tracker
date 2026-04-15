import axios from "axios";

const api = axios.create({ baseURL: "/" });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (email, password) =>
  api.post("/api/auth/login", { email, password }).then((r) => r.data);

export const getProfile = () =>
  api.get("/api/auth/profile").then((r) => r.data);

// Daily Log
export const getDailyLog = () =>
  api.get("/api/dailylog/today").then((r) => r.data);

export const getDailyLogHistory = (days = 30) =>
  api.get(`/api/dailylog/history?days=${days}`).then((r) => r.data);

export const updateWater = (glasses) =>
  api.patch("/api/dailylog/water", { glasses }).then((r) => r.data);

// Meals
export const getTodayMeals = () =>
  api.get("/api/meals").then((r) => r.data);

export const logMeal = (description, meal_type) =>
  api.post("/api/meals", { description, meal_type }).then((r) => r.data);

export const deleteMeal = (id) =>
  api.delete(`/api/meals/${id}`).then((r) => r.data);

// Progress
export const getProgress = () =>
  api.get("/api/progress").then((r) => r.data);

export const addProgress = (data) =>
  api.post("/api/progress", data).then((r) => r.data);

// Diet Plan
export const getWeeklyDietPlan = () =>
  api.get("/api/dietplan/weekly").then((r) => r.data);

// Workouts
export const getTodayWorkouts = () =>
  api.get("/api/workouts").then((r) => r.data);

export const logWorkout = (data) =>
  api.post("/api/workouts", data).then((r) => r.data);

export const deleteWorkout = (id) =>
  api.delete(`/api/workouts/${id}`).then((r) => r.data);
