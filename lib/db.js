const { db } = require("./sheetsDb");

let initialized = false;

async function getDb() {
  if (!initialized) {
    await db.init();
    initialized = true;
  }
  return db;
}

module.exports = { getDb };
