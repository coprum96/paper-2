# Paper 2 — Research Mode (SPbU experiment shell)

Separate experimental flow inside **Золотой Детектор**. The educational game (lessons, red flags, paywall, Buratino story) is **not** used as the measurement environment.

Protocol source: `empiric_research/outputs/manuscript_paper2/`

## Run locally

```bash
cd "/Users/stas/Workspace/buratino premium"
npm install
npm run dev
```

Open:

| URL | Meaning |
| --- | --- |
| `http://localhost:5173/` | Normal educational game (unchanged) |
| `http://localhost:5173/?research=1&study=2` | Study 2 (pressure × intervention) |
| `http://localhost:5173/?research=1&study=1` | Study 1 (pressure only + thought listing) |
| `http://localhost:5173/?research=1&study=2&pilot=1` | Pilot: Study 2 cells + thought listing after each choice |

Optional: set `VITE_RESEARCH_MODE=true` to force research shell for the whole deploy (dedicated research URL recommended).

## Flow

1. Consent (incomplete disclosure)  
2. Baseline: K1–K10, confidence, digital/financial literacy, exposure, demographics, attention  
3. Neutral filler (8–12 min conceptually; short in this build)  
4. Four fictional scenarios → matched 5s gate (neutral loader **or** pause+verify) → action UI (V/W/R/P/C/S shuffled)  
5. Study 1 or `pilot=1`: thought listing after choice  
6. Suspicion + decision confidence  
7. Manipulation checks + funnel item  
8. Debrief  
9. Download JSON / CSV (person + trials)

Data also persist in `localStorage` key `paper2_research_session_v2` (falls back to v1 on read).

## What is intentionally OFF

- Red-flag teaching popups  
- Lessons / 6 techniques / loss calculator  
- Paywall / monetization  
- Real bank brands, live links, credential fields  
- Auto-submit of unsafe actions when the urgency timer hits 0  

## Deploy suggestion

Use a **separate Vercel project or path** for research (e.g. `research.example.com/?research=1`) so game players are not routed into the experiment. Do not start the N=90 pilot until SPbU ethics approval fields are filled.

## Cloud sync (Supabase)

Completed sessions upsert into Supabase table `paper2_sessions` (see `SUPABASE_PAPER2_SYNC.md`).

You must run `supabase/paper2_sessions.sql` once in the Supabase SQL Editor before the first real participant.

Research shell uses:

- Coat of arms: `/public/img/spbu_gerb.png` (dark) and `spbu_gerb_white.png`
- Crimson `#8B1E3F` + warm paper background (not the game’s dark/gold theme)
- Progress bar under the institutional header

The educational game UI is unchanged.

## Next engineering steps (optional)

1. POST person/trials to the existing Express/Prisma backend with a `Paper2Session` model.  
2. Lengthen filler to a timed 8–12 minutes if required by preregistration.  
3. Researcher admin page to list sessions (no PII).  
4. After debrief, optional link to the full educational game.
