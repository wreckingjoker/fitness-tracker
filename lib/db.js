// Store the DB instance on `global` so it survives Next.js hot reloads
// and is shared across all API routes (avoiding repeated Google Sheets init calls).

async function getDb() {
  if (global._sheetsDb) return global._sheetsDb;

  // Use a promise lock so concurrent requests don't all trigger init at once
  if (!global._sheetsDbPromise) {
    const { db } = require("./sheetsDb");
    global._sheetsDbPromise = db.init().then(() => {
      global._sheetsDb = db;
      return db;
    }).catch((err) => {
      global._sheetsDbPromise = null; // allow retry on next request
      throw err;
    });
  }

  return global._sheetsDbPromise;
}

module.exports = { getDb };
