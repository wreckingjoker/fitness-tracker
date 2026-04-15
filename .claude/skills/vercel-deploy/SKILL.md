---
name: vercel-deploy
description: Use when someone asks to deploy to Vercel, push to production, deploy the project, or fix a Vercel deployment issue.
disable-model-invocation: false
---

## What This Skill Does

Guides a smooth deployment of FitTrack Kerala (React + Vite + Express + Google Sheets) to Vercel.
The project uses a single Express serverless function (`api/index.js`) that serves both the API
and the React static build. The `vercel-build` script in root `package.json` builds the client first.

---

## Pre-flight Checks

### 1. Verify `vercel.json` is correct

Read `vercel.json` and confirm it matches this exact structure:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node",
      "config": { "includeFiles": ["client/dist/**"] }
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/api/index.js" }
  ]
}
```

If it differs, fix it before continuing.

### 2. Verify root `package.json`

Read root `package.json` and confirm it has:
- `"engines": { "node": "24.x" }`
- `"scripts": { "vercel-build": "cd client && npm install && npm run build" }`
- All server dependencies: `@google/generative-ai`, `bcryptjs`, `cors`, `dotenv`, `express`, `googleapis`, `jsonwebtoken`

Fix any missing fields.

### 3. Verify `api/index.js` ends with static file serving

Read `api/index.js` and confirm it has these lines AFTER all route registrations:

```javascript
const distPath = path.join(__dirname, "../client/dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
```

Also confirm `const path = require("path");` is at the top.

### 4. Test the client build locally

Run:
```bash
cd client && npm run build
```

If the build fails, fix the errors before deploying. Common issues:
- Missing dependencies → `npm install`
- TypeScript/ESLint errors → fix the source file

### 5. Check git status

Run `git status`. If there are uncommitted changes:
- Stage and commit them with a meaningful message
- Push to GitHub: `git push`

If already clean and up to date, skip to the Vercel env vars check.

---

## Environment Variables Checklist

Tell the user to go to **Vercel → Project → Settings → Environment Variables** and verify all 7 are set:

| Variable | Where to find it |
|---|---|
| `GEMINI_API_KEY` | `server/.env` |
| `SPREADSHEET_ID` | `server/.env` — the Google Sheets ID from the URL |
| `GOOGLE_CLIENT_EMAIL` | `server/.env` — service account email |
| `GOOGLE_PRIVATE_KEY` | `server/.env` — full PEM key including BEGIN/END lines with `\n` |
| `JWT_SECRET` | `server/.env` |
| `CLIENT_URL` | The Vercel app URL e.g. `https://your-app.vercel.app` |
| `PORT` | `4000` |

**Critical notes:**
- `GOOGLE_PRIVATE_KEY` must be pasted as-is with `\n` literals — the server converts them automatically
- `JWT_SECRET` must NOT be `change_me_to_a_long_random_string` — use the real value from `server/.env`
- `CLIENT_URL` must match the actual Vercel domain exactly (used for CORS)

---

## Deploy Steps

1. Commit and push all changes to `main`:
   ```bash
   git add -A
   git commit -m "deploy: <describe what changed>"
   git push
   ```

2. Vercel auto-deploys on push. Monitor build logs at:
   `https://vercel.com/wreckingjoker/fitness-tracker`

3. Wait for the build to finish (~2-3 minutes). The build order is:
   - Root `vercel-build` script runs → builds `client/dist`
   - `@vercel/node` bundles `api/index.js` with `client/dist/**`
   - Deployment goes live

---

## Diagnosing Failures

| Error | Cause | Fix |
|---|---|---|
| `404 NOT_FOUND` | `vercel.json` wrong or build failed | Check Pre-flight steps 1–4 |
| `405 Method Not Allowed` | Old `rewrites` config instead of `builds`+`routes` | Fix `vercel.json` to use `builds` |
| `DB init failed: client_email field` | `GOOGLE_CLIENT_EMAIL` not set in Vercel | Add env var |
| `Login failed` | `JWT_SECRET` missing or `CLIENT_URL` mismatch | Check env vars |
| `Gemini extraction error` | `GEMINI_API_KEY` not set | Add env var |
| Build step fails | Client build error | Run `cd client && npm run build` locally first |
| Function timeout | `db.init()` slow on cold start | Expected on first request — subsequent requests are faster |

---

## Verify Deployment

After deployment, run these checks:
1. Open `https://your-app.vercel.app` — login page should load
2. Login with `shon@fittrack.local` / `fittrack123`
3. Log a test meal — confirm Gemini extracts nutrition
4. Check Dashboard updates with logged data

If login works but data doesn't load, the Google Sheets connection or SPREADSHEET_ID is wrong.
