/**
 * Google Sheets as a database.
 * Each sheet tab = one table. Row 1 = headers. Row 2+ = data.
 *
 * Setup:
 * 1. Create a Google Spreadsheet and note its ID (from the URL).
 * 2. Google Cloud Console → APIs → enable Google Sheets API.
 * 3. Create a Service Account → download JSON key.
 * 4. Share the spreadsheet with the service account email (Editor).
 * 5. Set SPREADSHEET_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY in server/.env.
 */

const { google } = require("googleapis");

// ── Schema definition ────────────────────────────────────────────────────────
const SHEET_HEADERS = {
  users: [
    "id", "name", "email", "password", "age", "gender",
    "height_cm", "weight_kg", "goal", "activity_level",
    "tdee_kcal", "target_kcal", "protein_target_g", "carbs_target_g",
    "fat_target_g", "fiber_target_g", "water_target", "cuisine", "created_at",
  ],
  meals: [
    "id", "user_id", "meal_type", "description", "items",
    "total_kcal", "protein_g", "carbs_g", "fat_g", "fiber_g", "logged_at",
  ],
  daily_log: [
    "id", "user_id", "date", "total_kcal", "total_protein_g",
    "total_carbs_g", "total_fat_g", "total_fiber_g", "water_glasses",
  ],
  progress: ["id", "user_id", "weight_kg", "waist_cm", "hip_cm", "notes", "recorded_at"],
  workouts: ["id", "user_id", "exercise", "sets", "reps", "weight_kg", "notes", "logged_at"],
  kerala_foods: ["id", "name", "alias", "kcal_per", "protein_g", "carbs_g", "fat_g", "fiber_g", "serving"],
};

const NUMERIC = new Set([
  "id", "user_id", "age", "height_cm", "weight_kg",
  "tdee_kcal", "target_kcal", "protein_target_g", "carbs_target_g",
  "fat_target_g", "fiber_target_g", "water_target",
  "total_kcal", "protein_g", "carbs_g", "fat_g", "fiber_g",
  "total_protein_g", "total_carbs_g", "total_fat_g", "total_fiber_g",
  "water_glasses", "waist_cm", "hip_cm", "kcal_per", "sets", "reps",
]);

// ── SheetsDb class ────────────────────────────────────────────────────────────
class SheetsDb {
  constructor() {
    this.spreadsheetId = process.env.SPREADSHEET_ID;
    this.api = null;
  }

  async init() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.api = google.sheets({ version: "v4", auth: await auth.getClient() });
    await this._ensureSheets();
    console.log("✓ Google Sheets DB connected");
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  async _ensureSheets() {
    const meta = await this.api.spreadsheets.get({ spreadsheetId: this.spreadsheetId });
    const existing = new Set(meta.data.sheets.map((s) => s.properties.title));

    // Create missing sheet tabs
    const addRequests = Object.keys(SHEET_HEADERS)
      .filter((name) => !existing.has(name))
      .map((title) => ({ addSheet: { properties: { title } } }));

    if (addRequests.length) {
      await this.api.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: { requests: addRequests },
      });
    }

    // Ensure each sheet has its header row
    for (const [name, headers] of Object.entries(SHEET_HEADERS)) {
      const res = await this.api.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${name}!A1:A1`,
      });
      const firstCell = res.data.values?.[0]?.[0];
      if (firstCell !== "id") {
        await this.api.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${name}!A1`,
          valueInputOption: "RAW",
          resource: { values: [headers] },
        });
      }
    }
  }

  _parse(headers, rawRow) {
    const obj = {};
    headers.forEach((h, i) => {
      const v = rawRow[i] ?? "";
      if (v === "") { obj[h] = NUMERIC.has(h) ? null : null; }
      else if (NUMERIC.has(h)) { obj[h] = parseFloat(v); }
      else { obj[h] = v; }
    });
    return obj;
  }

  async _raw(sheetName) {
    const res = await this.api.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:Z`,
    });
    return res.data.values || [];
  }

  // ── Public CRUD API ───────────────────────────────────────────────────────

  async getAll(sheetName) {
    const rows = await this._raw(sheetName);
    if (rows.length <= 1) return [];
    const headers = rows[0];
    return rows
      .slice(1)
      .filter((r) => r.some((c) => c !== ""))
      .map((r) => this._parse(headers, r));
  }

  async findById(sheetName, id) {
    const all = await this.getAll(sheetName);
    return all.find((r) => r.id == id) || null;
  }

  async findWhere(sheetName, predicate) {
    const all = await this.getAll(sheetName);
    return all.filter(predicate);
  }

  async insert(sheetName, data) {
    const rows = await this._raw(sheetName);
    const headers = rows[0] || SHEET_HEADERS[sheetName];
    const ids = rows.slice(1).map((r) => parseInt(r[0]) || 0);
    const id = ids.length ? Math.max(...ids) + 1 : 1;

    const row = headers.map((h) => {
      if (h === "id") return id;
      const v = data[h];
      return v === undefined || v === null ? "" : v;
    });

    await this.api.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:A`,
      valueInputOption: "RAW",
      resource: { values: [row] },
    });

    return this._parse(headers, row);
  }

  async update(sheetName, id, data) {
    const rows = await this._raw(sheetName);
    const headers = rows[0];
    const rowIdx = rows.findIndex((r, i) => i > 0 && r[0] == id);
    if (rowIdx === -1) throw new Error(`Row ${id} not found in ${sheetName}`);

    const updated = [...rows[rowIdx]];
    headers.forEach((h, i) => {
      if (h in data) updated[i] = data[h] === null || data[h] === undefined ? "" : data[h];
    });

    await this.api.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A${rowIdx + 1}:Z${rowIdx + 1}`,
      valueInputOption: "RAW",
      resource: { values: [updated] },
    });

    return this._parse(headers, updated);
  }

  async delete(sheetName, id) {
    const meta = await this.api.spreadsheets.get({ spreadsheetId: this.spreadsheetId });
    const sheet = meta.data.sheets.find((s) => s.properties.title === sheetName);
    if (!sheet) throw new Error(`Sheet ${sheetName} not found`);

    const rows = await this._raw(sheetName);
    const rowIdx = rows.findIndex((r, i) => i > 0 && r[0] == id);
    if (rowIdx === -1) throw new Error(`Row ${id} not found`);

    await this.api.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: "ROWS",
              startIndex: rowIdx,
              endIndex: rowIdx + 1,
            },
          },
        }],
      },
    });
  }

  async upsert(sheetName, where, data) {
    const all = await this.getAll(sheetName);
    const existing = all.find((row) =>
      Object.entries(where).every(([k, v]) => String(row[k]) === String(v))
    );
    if (existing) return this.update(sheetName, existing.id, { ...existing, ...data });
    return this.insert(sheetName, { ...where, ...data });
  }
}

const db = new SheetsDb();
module.exports = { db };
