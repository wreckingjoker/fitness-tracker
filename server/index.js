require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { db } = require("./services/sheetsDb");

const authRoutes = require("./routes/auth");
const mealsRoutes = require("./routes/meals");
const nutritionRoutes = require("./routes/nutrition");
const dailylogRoutes = require("./routes/dailylog");
const progressRoutes = require("./routes/progress");
const dietplanRoutes = require("./routes/dietplan");
const workoutsRoutes = require("./routes/workouts");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/meals", mealsRoutes);
app.use("/nutrition", nutritionRoutes);
app.use("/dailylog", dailylogRoutes);
app.use("/progress", progressRoutes);
app.use("/dietplan", dietplanRoutes);
app.use("/workouts", workoutsRoutes);

const PORT = process.env.PORT || 4000;

// Connect to Google Sheets, then start Express
db.init()
  .then(() => {
    app.listen(PORT, () => console.log(`Server → http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to Google Sheets:", err.message);
    console.error("Check SPREADSHEET_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY in server/.env");
    process.exit(1);
  });
