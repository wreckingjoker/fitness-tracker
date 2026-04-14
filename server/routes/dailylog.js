const express = require("express");
const { db } = require("../services/sheetsDb");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// GET /dailylog/today
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const today = todayStr();
    const logs = await db.findWhere(
      "daily_log",
      (r) => r.user_id == req.user.id && String(r.date) === today
    );
    const log = logs[0] || null;

    const user = await db.findById("users", req.user.id);
    const targets = user ? {
      target_kcal: user.target_kcal,
      protein_target_g: user.protein_target_g,
      carbs_target_g: user.carbs_target_g,
      fat_target_g: user.fat_target_g,
      fiber_target_g: user.fiber_target_g,
      water_target: user.water_target,
    } : {};

    res.json({
      total_kcal: log?.total_kcal || 0,
      total_protein_g: log?.total_protein_g || 0,
      total_carbs_g: log?.total_carbs_g || 0,
      total_fat_g: log?.total_fat_g || 0,
      total_fiber_g: log?.total_fiber_g || 0,
      water_glasses: log?.water_glasses || 0,
      targets,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /dailylog/history?days=30
// Computes per-day totals directly from the meals table (always accurate),
// then merges water_glasses from daily_log.
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 90);

    // Aggregate meals by date
    const meals = await db.findWhere("meals", (r) => r.user_id == req.user.id);
    const byDate = {};
    for (const m of meals) {
      const date = String(m.logged_at || "").split("T")[0];
      if (!date || date.length < 8) continue;
      if (!byDate[date]) {
        byDate[date] = { date, total_kcal: 0, total_protein_g: 0, total_carbs_g: 0, total_fat_g: 0, total_fiber_g: 0, water_glasses: 0 };
      }
      byDate[date].total_kcal     += parseFloat(m.total_kcal) || 0;
      byDate[date].total_protein_g += parseFloat(m.protein_g)  || 0;
      byDate[date].total_carbs_g   += parseFloat(m.carbs_g)    || 0;
      byDate[date].total_fat_g     += parseFloat(m.fat_g)      || 0;
      byDate[date].total_fiber_g   += parseFloat(m.fiber_g)    || 0;
    }

    // Round values
    for (const d of Object.values(byDate)) {
      d.total_kcal     = Math.round(d.total_kcal);
      d.total_protein_g = Math.round(d.total_protein_g * 10) / 10;
      d.total_carbs_g   = Math.round(d.total_carbs_g * 10) / 10;
      d.total_fat_g     = Math.round(d.total_fat_g * 10) / 10;
      d.total_fiber_g   = Math.round(d.total_fiber_g * 10) / 10;
    }

    // Merge water_glasses from daily_log
    const logs = await db.findWhere("daily_log", (r) => r.user_id == req.user.id);
    for (const log of logs) {
      const date = String(log.date || "").split("T")[0];
      if (byDate[date]) byDate[date].water_glasses = parseInt(log.water_glasses) || 0;
    }

    const sorted = Object.values(byDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-days);

    res.json(sorted);
  } catch (err) {
    console.error("history error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /dailylog/water
router.patch("/water", authMiddleware, async (req, res) => {
  const { glasses } = req.body;
  if (glasses === undefined || glasses < 0)
    return res.status(400).json({ error: "glasses (≥0) required" });

  try {
    const today = todayStr();
    const logs = await db.findWhere(
      "daily_log",
      (r) => r.user_id == req.user.id && String(r.date) === today
    );

    if (logs[0]) {
      await db.update("daily_log", logs[0].id, { water_glasses: glasses });
    } else {
      await db.insert("daily_log", {
        user_id: req.user.id, date: today, water_glasses: glasses,
        total_kcal: 0, total_protein_g: 0, total_carbs_g: 0, total_fat_g: 0, total_fiber_g: 0,
      });
    }
    res.json({ water_glasses: glasses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
