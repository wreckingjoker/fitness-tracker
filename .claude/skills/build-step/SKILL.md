---
name: build-step
description: Use when implementing a step from the build order, building a specific page or feature, asking what to build next, or resuming the FitTrack Kerala project.
argument-hint: [step number or feature name]
---

## What This Skill Does

Implements a numbered step from the FitTrack Kerala Build Order defined in CLAUDE.md, or determines which step to work on next.

## Context

Read these before acting:
1. `claude.md` (project root) — full build order table, file structure, stack, and workflows
2. The specific workflow file in `workflows/` that matches the step (e.g., `workflows/scaffold.md` for steps 1–4)

## Steps

1. **Identify the target step:**
   - If `$ARGUMENTS` is a number (e.g., `5`), implement Build Order Step $ARGUMENTS.
   - If `$ARGUMENTS` is a feature name (e.g., "MealLogger"), find the matching step.
   - If `$ARGUMENTS` is empty or "next", scan the file structure to find the last completed step, then implement the next one.

2. **Read the relevant workflow file** from `workflows/` for this step. Never skip this.

3. **Check what already exists** — read any files the step targets before writing. Understand before modifying.

4. **Implement the step** following the spec in CLAUDE.md exactly:
   - Use the exact filenames from the file structure diagram
   - Use the stack defined in the Tech Stack table (React + Vite, Tailwind, Node/Express, Prisma, Gemini API)
   - Wire to the exact API endpoints listed in the API Endpoints Reference table
   - Follow any workflow notes for edge cases

5. **Verify the step is done** by checking against the "Done When" column in the Build Order table.

6. Report back: what was built, what file(s) were created/modified, and what the next step is.

## Build Order Reference (from CLAUDE.md)

| Step | Task |
|------|------|
| 1 | Create `server/.env` from `.env.example`, add `GEMINI_API_KEY` |
| 2 | Run `tools/01_scaffold.sh` |
| 3 | Run `tools/02_db_setup.sh` (Prisma migrate + seed) |
| 4 | Run `tools/03_dev_start.sh` |
| 5 | Build `Sidebar.jsx` + routing |
| 6 | Build `Dashboard.jsx` with static mock data |
| 7 | Build `MealLogger.jsx` UI |
| 8 | Wire `POST /meals/log` + `geminiService.js` |
| 9 | Connect Dashboard to live API |
| 10 | Build `Progress.jsx` with Recharts |
| 11 | Build `DietPlan.jsx` |
| 12 | Build `Workouts.jsx` |
| 13 | Add JWT auth |
| 14 | Mobile responsive polish |

## Notes

- For steps 1–4 (scaffold + DB), generate the shell scripts in `tools/` per the file structure — do not run them directly.
- For Gemini-related steps (step 8, step 11), use the `/gemini-service` skill for the service implementation.
- User profile is pre-seeded per the JSON in CLAUDE.md — do not recreate it in UI code.
- All macro bar widths must use `Math.min(pct, 100)` to prevent overflow.
- Always check `workflows/error-recovery.md` if a step fails.
