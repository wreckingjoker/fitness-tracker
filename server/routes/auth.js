const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../services/sheetsDb");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// POST /auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "name, email and password required" });
  try {
    const existing = await db.findWhere("users", (r) => r.email === email);
    if (existing.length) return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.insert("users", {
      name, email, password: hashed,
      age: 23, gender: "male", height_cm: 175, weight_kg: 68.5,
      goal: "lose_belly_fat", activity_level: "moderately_active",
      tdee_kcal: 2200, target_kcal: 1850,
      protein_target_g: 150, carbs_target_g: 200, fat_target_g: 55,
      fiber_target_g: 30, water_target: 8, cuisine: "kerala",
      created_at: new Date().toISOString(),
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });
  try {
    const users = await db.findWhere("users", (r) => r.email === email);
    const user = users[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /auth/profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await db.findById("users", req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password: _, ...safe } = user;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
