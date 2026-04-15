const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb } = require("../../../lib/db");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  try {
    const db = await getDb();
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
}
