-- Paper 2 research sessions (run once in Supabase SQL Editor)
-- Project: dgzaxadxoegluktfnzhu

create table if not exists public.paper2_sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id text not null unique,
  study integer not null check (study in (1, 2)),
  pilot boolean not null default false,
  condition_pressure text not null check (condition_pressure in ('control', 'urgency', 'authority')),
  condition_intervention text not null check (condition_intervention in ('none', 'pause_verify')),
  completed boolean not null default false,
  attention_pass integer,
  knowledge_score double precision,
  duration_sec integer,
  app_version text,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists paper2_sessions_completed_idx on public.paper2_sessions (completed);
create index if not exists paper2_sessions_study_idx on public.paper2_sessions (study);
create index if not exists paper2_sessions_created_idx on public.paper2_sessions (created_at desc);

alter table public.paper2_sessions enable row level security;

-- Anonymous participants may INSERT and UPDATE (upsert by participant_id).
-- They must NOT be able to SELECT other people's rows.
drop policy if exists paper2_anon_insert on public.paper2_sessions;
create policy paper2_anon_insert
  on public.paper2_sessions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists paper2_anon_update on public.paper2_sessions;
create policy paper2_anon_update
  on public.paper2_sessions
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- No SELECT policy for anon → participants cannot download the full table.
-- You (project owner) read/export in Supabase Dashboard → Table Editor → paper2_sessions.

comment on table public.paper2_sessions is 'Paper 2 SPbU experiment: de-identified person+trials JSON in payload';
