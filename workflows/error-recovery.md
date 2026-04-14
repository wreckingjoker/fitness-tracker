# Workflow: Error Recovery

## Common errors and fixes

1. **Gemini returns non-JSON**
   → The strip regex in `geminiService.js` handles markdown fences.
   → If still failing, check the raw response with `console.log(raw)` and adjust the regex.
   → Fall back to `keralaFoodFallback.js` fuzzy match.

2. **Prisma migration fails**
   → Run `cd server && npx prisma migrate reset` (drops + recreates DB), then re-seed.

3. **CORS errors**
   → Check `CLIENT_URL` in `server/.env` matches Vite dev port (default 5173) exactly.

4. **JWT invalid/expired**
   → Clear localStorage `token` on frontend, redirect to `/login`.

5. **Macro bars overflow 100%**
   → Ensure `MacroBar.jsx` uses `Math.min(pct, 100)` for width calculation.

6. **Daily totals not updating after meal log**
   → Check `DailyLog` upsert in `meals.js` — verify the `date` value is midnight local time.
   → Check compound unique key name: Prisma generates `user_id_date` for `@@unique([user_id, date])`.

7. **Kerala food not recognized by Gemini**
   → Add to `KeralaFood` seed table in `server/prisma/seed.js` and re-run: `node prisma/seed.js`.

8. **`@google/generative-ai` not installed**
   → Run `cd server && npm install @google/generative-ai`.

9. **Port already in use**
   → Change `PORT` in `server/.env` or kill the process: `npx kill-port 4000`.
