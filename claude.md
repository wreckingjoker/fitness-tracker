# CLAUDE.md — Kerala Diet & Fitness Tracker Web App

## Project: FitTrack Kerala — Personalized Diet & Gym Tracker

## User Profile: Male, 23 yrs, 175 cm, 68.5 kg | Goal: Reduce belly fat & love handles

## Stack: React + Node.js + PostgreSQL + Claude API | Date: 14/04/2026

---

## Project Overview

You are operating inside the **WAT Framework (Workflows, Agents, Tools)** for building a full-stack web application that helps a Kerala-based gym user track food intake, auto-extract nutrition data from natural language meal descriptions (including Kerala-specific foods), and monitor fitness progress on a dashboard.

The AI meal logger is the core feature — the user types what they ate in plain language (e.g., "had 3 puttu with kadala curry") and the system calls the Claude API to extract nutrition data, then updates the dashboard automatically.

---

## The WAT Architecture

### Layer 1 — Workflows (`workflows/`)

Markdown SOPs stored in `workflows/`. Each workflow defines the objective, required inputs, which tools/scripts to use and in order, expected outputs, and edge case handling. Read the relevant workflow before taking any action. Never overwrite workflow files unless explicitly instructed.

### Layer 2 — Agent (You)

You are the decision-maker and orchestrator. You plan the feature → generate code → coordinate the build pipeline → recover from errors. Never skip workflow reading. Delegate all file generation to the tool scripts listed below.

### Layer 3 — Tools (`tools/`)

Shell and JS/Python scripts in `tools/` that scaffold, seed, and validate the application. Run these in order. Never hardcode secrets — use `.env` for all API keys and DB credentials.

---

## Tech Stack

| Layer     | Tool                                  | Purpose                                         |
| --------- | ------------------------------------- | ----------------------------------------------- |
| Frontend  | React 18 + Vite                       | UI — dashboard, meal logger, progress charts    |
| Styling   | Tailwind CSS                          | Utility-first responsive design                 |
| Charts    | Recharts                              | Macro rings, calorie bars, weekly trend charts  |
| Backend   | Node.js + Express                     | REST API — meals, nutrition, users, progress    |
| Database  | PostgreSQL                            | Persistent storage for meals, users, daily logs |
| ORM       | Prisma                                | Schema management + type-safe DB queries        |
| AI Engine | Gemini API (gemini-1.5-flash, free tier)      | Natural language → structured nutrition JSON    |
| Auth      | JWT (jsonwebtoken)                    | Session management                              |
| Config    | `.env`                                | All secrets and tunable config values           |

---

## User Profile (Pre-seeded in DB)

```json
{
  "name": "Ahmed",
  "age": 23,
  "gender": "male",
  "height_cm": 175,
  "weight_kg": 68.5,
  "goal": "lose_belly_fat",
  "activity_level": "moderately_active",
  "tdee_kcal": 2200,
  "daily_target_kcal": 1850,
  "protein_target_g": 150,
  "carbs_target_g": 200,
  "fat_target_g": 55,
  "fiber_target_g": 30,
  "water_target_glasses": 8,
  "cuisine": "kerala"
}
```

---

## Project File Structure

```
fittrack-kerala/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Main dashboard — stats, macros, meals
│   │   │   ├── MealLogger.jsx       # AI meal input + logged meals list
│   │   │   ├── DietPlan.jsx         # Weekly Kerala meal plan generator
│   │   │   ├── Progress.jsx         # Charts — weight, waist, weekly trends
│   │   │   └── Workouts.jsx         # Gym log — sets, reps, exercises
│   │   ├── components/
│   │   │   ├── MacroBar.jsx         # Reusable progress bar for macros
│   │   │   ├── StatCard.jsx         # Metric card (calories, protein, etc.)
│   │   │   ├── MealCard.jsx         # Single logged meal display
│   │   │   ├── WaterTracker.jsx     # 8-glass water toggle UI
│   │   │   └── Sidebar.jsx          # Navigation sidebar
│   │   ├── hooks/
│   │   │   └── useDailyLog.js       # Fetch + mutate today's nutrition log
│   │   ├── api/
│   │   │   └── client.js            # Axios instance + all API calls
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Node.js + Express backend
│   ├── routes/
│   │   ├── meals.js                 # POST /meals/log, GET /meals/today
│   │   ├── nutrition.js             # POST /nutrition/extract (Gemini API)
│   │   ├── progress.js              # GET/POST /progress (weight, waist)
│   │   ├── dietplan.js              # GET /dietplan/weekly
│   │   └── auth.js                  # POST /auth/login, /auth/register
│   ├── services/
│   │   ├── geminiService.js         # Gemini API call — nutrition extraction
│   │   ├── nutritionCalc.js         # TDEE calc, macro totals, deficit logic
│   │   └── keralaFoodFallback.js    # Local Kerala food DB (offline fallback)
│   ├── prisma/
│   │   ├── schema.prisma            # DB schema
│   │   └── seed.js                  # Seed user profile + Kerala food table
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── .env                         # GEMINI_API_KEY, DATABASE_URL, JWT_SECRET
│   └── index.js                     # Express app entry point
│
├── tools/
│   ├── 01_scaffold.sh               # Creates folder structure + installs deps
│   ├── 02_db_setup.sh               # Runs prisma migrate + seed
│   ├── 03_dev_start.sh              # Starts both client and server (concurrently)
│   └── 04_test_ai_extract.sh        # Test Claude API meal extraction endpoint
│
├── workflows/
│   ├── scaffold.md                  # Step-by-step project setup
│   ├── ai-meal-logger.md            # How the Claude API extraction works
│   ├── dashboard.md                 # Dashboard data flow
│   ├── diet-plan.md                 # Weekly meal plan generation
│   └── error-recovery.md           # Common errors and fixes
│
├── .env.example                     # Template — copy to server/.env
└── CLAUDE.md                        # This file — single source of truth
```

---

## `.env.example`

```env
# Copy this to server/.env and fill in values

GEMINI_API_KEY=AIza...          # Get free key from https://aistudio.google.com/apikey
DATABASE_URL=postgresql://user:password@localhost:5432/fittrack_kerala
JWT_SECRET=your_jwt_secret_here
PORT=4000
CLIENT_URL=http://localhost:5173
```

---

## Database Schema (`server/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               Int      @id @default(autoincrement())
  name             String
  age              Int
  gender           String
  height_cm        Float
  weight_kg        Float
  goal             String
  activity_level   String
  tdee_kcal        Int
  target_kcal      Int
  protein_target_g Int
  carbs_target_g   Int
  fat_target_g     Int
  fiber_target_g   Int
  water_target     Int
  cuisine          String   @default("kerala")
  meals            Meal[]
  progress         Progress[]
  created_at       DateTime @default(now())
}

model Meal {
  id           Int      @id @default(autoincrement())
  user_id      Int
  user         User     @relation(fields: [user_id], references: [id])
  meal_type    String   // breakfast | lunch | dinner | snack
  description  String   // raw user input: "3 puttu with kadala curry"
  items        Json     // parsed array from Claude API
  total_kcal   Int
  protein_g    Float
  carbs_g      Float
  fat_g        Float
  fiber_g      Float
  logged_at    DateTime @default(now())
}

model DailyLog {
  id              Int      @id @default(autoincrement())
  user_id         Int
  date            DateTime @db.Date
  total_kcal      Int      @default(0)
  total_protein_g Float    @default(0)
  total_carbs_g   Float    @default(0)
  total_fat_g     Float    @default(0)
  total_fiber_g   Float    @default(0)
  water_glasses   Int      @default(0)
  @@unique([user_id, date])
}

model Progress {
  id           Int      @id @default(autoincrement())
  user_id      Int
  user         User     @relation(fields: [user_id], references: [id])
  weight_kg    Float?
  waist_cm     Float?
  hip_cm       Float?
  notes        String?
  recorded_at  DateTime @default(now())
}

model KeralaFood {
  id         Int    @id @default(autoincrement())
  name       String @unique  // "puttu", "appam", "fish curry"
  alias      String?         // alternate names
  kcal_per   Float           // per standard serving
  protein_g  Float
  carbs_g    Float
  fat_g      Float
  fiber_g    Float
  serving    String          // "1 piece (80g)", "1 cup (200ml)"
}
```

---

## Core Service — Gemini API Meal Extractor (`server/services/geminiService.js`)

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `
You are a nutrition expert specializing in Kerala cuisine and Indian food.
When given a meal description, extract each food item and return ONLY a valid JSON array.
No preamble, no markdown code fences, no explanation — only the raw JSON array.

Each item in the array must have:
- name: string (exact food name)
- quantity: string (e.g. "3 pieces", "1 cup", "200g")
- calories: number (kcal)
- protein_g: number
- carbs_g: number
- fat_g: number
- fiber_g: number

Use Kerala home-cooking standard portions. Examples:
- 1 puttu = 180 kcal, 4g protein, 38g carbs, 1g fat, 2g fiber
- 1 appam = 120 kcal, 2g protein, 25g carbs, 1g fat, 0.5g fiber
- 1 cup kadala curry = 220 kcal, 10g protein, 30g carbs, 6g fat, 8g fiber
- 1 cup rice = 200 kcal, 4g protein, 44g carbs, 0.5g fat, 0.6g fiber
- 1 piece fish curry (Kerala style) = 180 kcal, 22g protein, 4g carbs, 8g fat, 0g fiber
- 1 parotta = 210 kcal, 4g protein, 35g carbs, 7g fat, 1g fiber
- 1 cup sambar = 90 kcal, 4g protein, 14g carbs, 2g fat, 3g fiber

If unsure, use conservative estimates. Always return valid JSON with no surrounding text.
`;

async function extractNutrition(mealDescription) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const result = await model.generateContent(mealDescription);
    const raw = result.response.text().trim();
    // Strip markdown code fences if Gemini wraps response
    const jsonStr = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const items = JSON.parse(jsonStr);

    const totals = items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein_g: acc.protein_g + item.protein_g,
        carbs_g: acc.carbs_g + item.carbs_g,
        fat_g: acc.fat_g + item.fat_g,
        fiber_g: acc.fiber_g + item.fiber_g,
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 },
    );

    return { items, totals, success: true };
  } catch (err) {
    console.error("Gemini extraction error:", err.message);
    return { items: [], totals: null, success: false, error: err.message };
  }
}

module.exports = { extractNutrition };
```

---

## API Endpoints Reference

| Method | Route              | Description                                 |
| ------ | ------------------ | ------------------------------------------- |
| POST   | `/auth/login`      | Login — returns JWT                         |
| POST   | `/auth/register`   | Register new user                           |
| GET    | `/meals/today`     | Get all meals logged today                  |
| POST   | `/meals/log`       | Log a new meal (triggers Claude extraction) |
| DELETE | `/meals/:id`       | Remove a logged meal                        |
| GET    | `/dailylog/today`  | Get today's nutrition totals                |
| PATCH  | `/dailylog/water`  | Update water glass count                    |
| GET    | `/progress`        | Get all progress entries                    |
| POST   | `/progress`        | Add weight/waist measurement                |
| GET    | `/dietplan/weekly` | Get AI-generated weekly Kerala meal plan    |
| GET    | `/profile`         | Get user profile + targets                  |

---

## Kerala Food Fallback Table (`server/services/keralaFoodFallback.js`)

Used when Claude API is unavailable. Covers the 30 most common Kerala foods with standard serving nutrition data. Includes: puttu, appam, idiyappam, pathiri, dosa, idli, parotta, rice, kanji, fish curry, beef fry, chicken curry, egg roast, kadala curry, sambar, avial, thoran, olan, mezhukkupuratti, pazham pori, unniyappam, banana, coconut chutney, sulaimani tea, and more.

---

## Workflows

### Workflow: Scaffold (`workflows/scaffold.md`)

1. Open VS Code with Claude Code extension active
2. Create root folder: `mkdir fittrack-kerala && cd fittrack-kerala`
3. Run `tools/01_scaffold.sh` — creates all folders, installs npm deps for client and server
4. Copy `.env.example` to `server/.env` and fill in your `ANTHROPIC_API_KEY` and `DATABASE_URL`
5. Run `tools/02_db_setup.sh` — runs `prisma migrate dev` and `prisma db seed`
6. Verify DB: open Prisma Studio with `npx prisma studio` from `server/`
7. Run `tools/03_dev_start.sh` — starts both Vite (port 5173) and Express (port 4000) concurrently
8. Open `http://localhost:5173` — you should see the dashboard

### Workflow: AI Meal Logger (`workflows/ai-meal-logger.md`)

Flow:

1. User types meal in plain text in `MealLogger.jsx` input field
2. Frontend `POST /meals/log` with `{ description, meal_type, user_id }`
3. Express route calls `geminiService.extractNutrition(description)`
4. Claude API returns JSON array of food items with nutrition data
5. Server saves `Meal` record + updates `DailyLog` totals for today
6. Frontend refetches today's log and re-renders dashboard macros + meal list

Test with: `tools/04_test_ai_extract.sh` — sends a sample Kerala meal and prints the parsed JSON.

### Workflow: Dashboard (`workflows/dashboard.md`)

Dashboard loads on mount:

1. `GET /dailylog/today` → renders calorie counter, macro bars, water tracker
2. `GET /meals/today` → renders meal list (breakfast, lunch, dinner, snack sections)
3. `GET /progress` (last 7 entries) → renders weight/waist mini chart
4. Streak is calculated client-side from `DailyLog` history (days with ≥1 meal logged)

All macro bars use `(actual / target) * 100` for fill width. Bars cap at 100% visually.

### Workflow: Diet Plan Generator (`workflows/diet-plan.md`)

1. User visits `/diet-plan` page
2. Frontend `GET /dietplan/weekly` with user activity level as query param
3. Server calls Gemini API with system instruction: _"Generate a 7-day Kerala meal plan for a 23-year-old male, 175cm, 68.5kg, targeting 1850 kcal/day with 150g protein. Include traditional Kerala breakfast, lunch, and dinner options. Return structured JSON."_
4. Response is parsed and rendered as a weekly grid with per-day calorie totals

### Workflow: Error Recovery (`workflows/error-recovery.md`)

1. **Claude API returns non-JSON** → wrap parse in try/catch; fall back to `keralaFoodFallback.js` fuzzy match on description keywords
2. **Prisma migration fails** → run `npx prisma migrate reset` (drops and recreates DB), then re-seed
3. **CORS errors** → verify `CLIENT_URL` in `.env` matches Vite dev server port exactly
4. **JWT invalid/expired** → clear localStorage token on frontend, redirect to `/login`
5. **Macro bars overflow 100%** → cap with `Math.min(pct, 100)` in `MacroBar.jsx`
6. **Daily totals not updating** → check `DailyLog` upsert logic uses today's date in UTC; verify timezone handling in `nutritionCalc.js`
7. **Kerala food not recognized** → add to `KeralaFood` seed table in `prisma/seed.js` and re-run seed

---

## Build Order

| Step | Task                                           | Done When                                                                  |
| ---- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| 1    | Create `.env` from `.env.example`, add API key | `.env` file present with real values                                       |
| 2    | Run `tools/01_scaffold.sh`                     | All folders exist, `npm install` complete for client + server              |
| 3    | Run `tools/02_db_setup.sh`                     | Prisma Studio shows User, Meal, DailyLog, KeralaFood tables with seed data |
| 4    | Run `tools/03_dev_start.sh`                    | Dashboard loads at `localhost:5173`, API responds at `localhost:4000`      |
| 5    | Build `Sidebar.jsx` + routing                  | All 5 pages reachable via sidebar nav                                      |
| 6    | Build `Dashboard.jsx` with static mock data    | Stat cards, macro bars, water tracker, meal list render correctly          |
| 7    | Build `MealLogger.jsx`                         | Text input + meal type selector + submit button visible                    |
| 8    | Wire `POST /meals/log` + `geminiService.js`     | Typing "3 puttu with kadala curry" extracts and logs nutrition             |
| 9    | Connect dashboard to live API                  | Macro bars and calorie counter update after meal is logged                 |
| 10   | Build `Progress.jsx` with Recharts             | Weight and waist trend charts render from DB data                          |
| 11   | Build `DietPlan.jsx`                           | 7-day Kerala meal plan grid renders with per-meal macros                   |
| 12   | Build `Workouts.jsx`                           | Gym log form works — exercise, sets, reps saved to DB                      |
| 13   | Add JWT auth (login/register pages)            | Protected routes redirect to login if no valid token                       |
| 14   | Final polish — mobile responsive               | All pages usable on 390px viewport (iPhone)                                |

---

## How to Use This File with Claude Code (VS Code)

- **Start a session**: `"Follow CLAUDE.md and begin with Step 1 of the Build Order"`
- **Scaffold the project**: `"Generate tools/01_scaffold.sh per CLAUDE.md file structure"`
- **Build a specific page**: `"Build Dashboard.jsx per CLAUDE.md — connect to GET /dailylog/today and GET /meals/today"`
- **Wire the AI logger**: `"Implement geminiService.js per CLAUDE.md using @google/generative-ai SDK and connect it to POST /meals/log"`
- **Fix a bug**: `"The macro bars are overflowing — re-read CLAUDE.md error recovery and fix MacroBar.jsx"`
- **Add a Kerala food**: `"Add 'pazham pori' to the KeralaFood seed table per CLAUDE.md schema and re-seed"`
- **Generate the diet plan route**: `"Build GET /dietplan/weekly per CLAUDE.md workflow — call Gemini API with the user's profile targets"`
- **If Claude Code drifts**: `"Re-read CLAUDE.md"` to snap back to the correct stack and schema

Keep this file in the project root at all times. It is the single source of truth for all schemas, API routes, service logic, and build steps.
