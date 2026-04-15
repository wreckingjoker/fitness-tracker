export default async function handler(req, res) {
  try {
    const { getDb } = require("../../lib/db");
    const db = await getDb();
    const users = await db.findWhere("users", () => true);
    res.json({ ok: true, users: users.length });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
      spreadsheet_id: process.env.SPREADSHEET_ID ? "set" : "MISSING",
      client_email: process.env.GOOGLE_CLIENT_EMAIL ? "set" : "MISSING",
      private_key: process.env.GOOGLE_PRIVATE_KEY ? `set (${process.env.GOOGLE_PRIVATE_KEY.length} chars)` : "MISSING",
    });
  }
}
