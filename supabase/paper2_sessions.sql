-- Paper 2 research sessions
-- Run ALL of this once in Supabase → SQL Editor → Run
-- Project: dgzaxadxoegluktfnzhu
--
-- Fixes: "new row violates row-level security policy for table paper2_sessions"
-- Cause: browser upsert needs write path that bypasses participant SELECT limits.
-- Solution: SECURITY DEFINER RPC + grants (anon cannot SELECT the table).

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

-- Table grants (RLS still applies for direct table access)
grant usage on schema public to anon, authenticated;
grant insert, update on table public.paper2_sessions to anon, authenticated;
-- No SELECT grant to anon — participants must not read the table.
revoke select on table public.paper2_sessions from anon;
grant select on table public.paper2_sessions to authenticated;

-- Direct INSERT/UPDATE policies (backup; primary path is RPC below)
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

-- Drop any accidental SELECT policy for anon
drop policy if exists paper2_anon_select on public.paper2_sessions;

-- Primary write path: upsert via SECURITY DEFINER (bypasses RLS safely server-side)
create or replace function public.upsert_paper2_session(row jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if row is null
     or coalesce(row->>'participant_id', '') = ''
     or row->'payload' is null
     or jsonb_typeof(row->'payload') <> 'object' then
    raise exception 'invalid paper2 session payload';
  end if;

  insert into public.paper2_sessions as s (
    participant_id,
    study,
    pilot,
    condition_pressure,
    condition_intervention,
    completed,
    attention_pass,
    knowledge_score,
    duration_sec,
    app_version,
    payload,
    updated_at
  )
  values (
    row->>'participant_id',
    (row->>'study')::integer,
    coalesce((row->>'pilot')::boolean, false),
    row->>'condition_pressure',
    row->>'condition_intervention',
    coalesce((row->>'completed')::boolean, false),
    nullif(row->>'attention_pass', '')::integer,
    nullif(row->>'knowledge_score', '')::double precision,
    nullif(row->>'duration_sec', '')::integer,
    nullif(row->>'app_version', ''),
    row->'payload',
    coalesce((row->>'updated_at')::timestamptz, now())
  )
  on conflict (participant_id) do update
  set
    study = excluded.study,
    pilot = excluded.pilot,
    condition_pressure = excluded.condition_pressure,
    condition_intervention = excluded.condition_intervention,
    completed = excluded.completed,
    attention_pass = excluded.attention_pass,
    knowledge_score = excluded.knowledge_score,
    duration_sec = excluded.duration_sec,
    app_version = excluded.app_version,
    payload = excluded.payload,
    updated_at = excluded.updated_at
  returning s.id into v_id;

  return v_id;
end;
$$;

revoke all on function public.upsert_paper2_session(jsonb) from public;
grant execute on function public.upsert_paper2_session(jsonb) to anon, authenticated;

comment on table public.paper2_sessions is 'Paper 2 SPbU experiment: de-identified person+trials JSON in payload';
comment on function public.upsert_paper2_session(jsonb) is 'Anon-safe upsert for research clients; no SELECT on table for anon';
