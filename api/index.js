require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { db } = require("../server/services/sheetsDb");

const authRoutes = require("../server/routes/auth");
const mealsRoutes = require("../server/routes/meals");
const nutritionRoutes = require("../server/routes/nutrition");
const dailylogRoutes = require("../server/routes/dailylog");
const progressRoutes = require("../server/routes/progress");
const dietplanRoutes = require("../server/routes/dietplan");
const workoutsRoutes = require("../server/routes/workouts");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// Lazy DB init — cached across warm invocations on Vercel
let dbReady = false;
app.use(async (req, res, next) => {
  if (!dbReady) {
    try {
      await db.init();
      dbReady = true;
    } catch (err) {
      return res.status(500).json({ error: "DB init failed: " + err.message });
    }
  }
  next();
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/meals", mealsRoutes);
app.use("/nutrition", nutritionRoutes);
app.use("/dailylog", dailylogRoutes);
app.use("/progress", progressRoutes);
app.use("/dietplan", dietplanRoutes);
app.use("/workouts", workoutsRoutes);

// Serve React build (production)
const distPath = path.join(__dirname, "../client/dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

module.exports = app;
