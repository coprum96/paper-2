# Paper 2 — SPbU research experiment

Experimental web app for the SPbU study:

**Knowing, Remembering, Acting** / *Знать, помнить, действовать*

Built on the Золотой Детектор / Buratino codebase. The educational game at `/` is unchanged. The **research shell** is a separate flow.

## Participant link (after deploy)

```
https://YOUR-DEPLOY.vercel.app/?research=1&study=2&pilot=1
```

| Query | Meaning |
| --- | --- |
| `research=1` | Research mode (not the game) |
| `study=1` \| `study=2` | Study 1 (activation) or Study 2 (execution × intervention) |
| `pilot=1` | Collect thought listing after each trial |

## Local

```bash
npm install
cp .env.example .env   # add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Open: http://localhost:5173/?research=1&study=2&pilot=1

## Supabase (required once)

1. Run SQL in `supabase/paper2_sessions.sql` (SQL Editor).
2. Set env vars (see `.env.example` and `SUPABASE_PAPER2_SYNC.md`).
3. Completed sessions appear in table `paper2_sessions`.

## Docs

- `RESEARCH_MODE.md` — research shell
- `SUPABASE_PAPER2_SYNC.md` — cloud sync for the researcher
- Protocol / ethics live in the separate `empiric_research` project

## Stack

Vite · React · TypeScript · Tailwind · Zustand · Supabase
