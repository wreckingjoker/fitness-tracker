export default async function handler(req, res) {
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
  const processedKey = rawKey.replace(/\\n/g, "\n");

  const keyInfo = {
    raw_length: rawKey.length,
    processed_length: processedKey.length,
    starts_with: rawKey.slice(0, 40),
    ends_with: rawKey.slice(-30),
    has_literal_slash_n: rawKey.includes("\\n"),
    has_actual_newline: rawKey.includes("\n"),
    processed_starts_with: processedKey.slice(0, 40),
  };

  try {
    const { getDb } = require("../../lib/db");
    const db = await getDb();
    const users = await db.findWhere("users", () => true);
    res.json({ ok: true, users: users.length });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
      key_info: keyInfo,
    });
  }
}
