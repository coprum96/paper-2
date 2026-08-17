import type { PersonRecord } from './types';
import { getSupabaseBrowserClient, isSupabaseConfigured } from './supabaseClient';

export type SyncResult =
  | { ok: true; mode: 'supabase' }
  | { ok: false; mode: 'supabase' | 'unconfigured'; message: string };

/** Upsert full person+trials payload via SECURITY DEFINER RPC (avoids anon RLS upsert issues). */
export async function syncPersonToSupabase(person: PersonRecord): Promise<SyncResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      mode: 'unconfigured',
      message: 'Supabase не настроен (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).',
    };
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, mode: 'unconfigured', message: 'Не удалось создать клиент Supabase.' };
  }

  const row = {
    participant_id: person.participant_id,
    study: person.study,
    pilot: person.pilot,
    condition_pressure: person.condition_pressure,
    condition_intervention: person.condition_intervention,
    completed: Boolean(person.completed_at),
    attention_pass: person.attention_pass,
    knowledge_score: person.knowledge_score,
    duration_sec: person.duration_sec,
    app_version: person.app_version,
    payload: person,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.rpc('upsert_paper2_session', { row });

  if (error) {
    const hint =
      /row-level security|permission denied|function .* does not exist|PGRST202/i.test(error.message)
        ? ' Выполните заново весь SQL из supabase/paper2_sessions.sql в Supabase → SQL Editor.'
        : '';
    return { ok: false, mode: 'supabase', message: `${error.message}${hint}` };
  }
  return { ok: true, mode: 'supabase' };
}
