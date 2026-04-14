# Workflow: Scaffold

## Objective
Get the project running locally from scratch.

## Steps
1. Copy `.env.example` → `server/.env`. Fill in `GEMINI_API_KEY` and `DATABASE_URL`.
2. Run `bash tools/01_scaffold.sh` — installs npm deps for client + server.
3. Run `bash tools/02_db_setup.sh` — runs Prisma migrate + seeds Kerala food data + Ahmed's profile.
4. Run `bash tools/03_dev_start.sh` — starts Vite (5173) and Express (4000).
5. Open http://localhost:5173 — dashboard should load.

## Expected state after completion
- `node_modules/` present in both `client/` and `server/`
- Prisma Studio shows: User (1 row), KeralaFood (30+ rows)
- Dashboard renders at localhost:5173
- API responds at localhost:4000/health
