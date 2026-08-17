import { ACTION_OPTIONS, FINANCIAL_LITERACY, KNOWLEDGE_ITEMS, POSSESSOR_THRESHOLD } from './data/measures';
import type { ActionCode, PersonRecord, TrialRecord } from './types';

export function scoreKnowledge(answers: PersonRecord['knowledge_answers']): {
  score: number;
  possessor: 0 | 1;
} {
  let correct = 0;
  for (const item of KNOWLEDGE_ITEMS) {
    const a = answers[item.id];
    if (a === 'true' && item.key === true) correct += 1;
    if (a === 'false' && item.key === false) correct += 1;
  }
  const score = correct / KNOWLEDGE_ITEMS.length;
  return { score, possessor: score >= POSSESSOR_THRESHOLD ? 1 : 0 };
}

export function scoreDigitalLiteracy(items: PersonRecord['digital_literacy_items']): number | null {
  const vals = Object.values(items).filter((v): v is number => typeof v === 'number');
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function scoreFinancialLiteracy(answers: PersonRecord['financial_literacy_answers']): number {
  let correct = 0;
  for (const item of FINANCIAL_LITERACY) {
    if (answers[item.id] === item.key) correct += 1;
  }
  return correct / FINANCIAL_LITERACY.length;
}

export function codeAction(code: ActionCode): Pick<TrialRecord, 'verification_behavior' | 'safe_choice'> {
  const row = ACTION_OPTIONS.find((o) => o.code === code)!;
  return { verification_behavior: row.verification, safe_choice: row.safe };
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPersonJson(person: PersonRecord) {
  downloadBlob(
    `paper2_${person.participant_id}_person.json`,
    JSON.stringify(person, null, 2),
    'application/json'
  );
}

export function exportTrialsCsv(person: PersonRecord) {
  const header = [
    'participant_id',
    'study',
    'pilot',
    'condition_pressure',
    'condition_intervention',
    'scenario_id',
    'scenario_order',
    'action_code',
    'verification_behavior',
    'safe_choice',
    'response_latency_ms',
    'timeout_flag',
    'suspicion',
    'decision_confidence',
    'thought_listing_text',
    'knowledge_score',
    'knowledge_possessor',
  ];
  const rows = person.trials.map((t) =>
    [
      person.participant_id,
      person.study,
      person.pilot ? 1 : 0,
      person.condition_pressure,
      person.condition_intervention,
      t.scenario_id,
      t.scenario_order,
      t.action_code ?? '',
      t.verification_behavior ?? '',
      t.safe_choice ?? '',
      t.response_latency_ms ?? '',
      t.timeout_flag,
      t.suspicion ?? '',
      t.decision_confidence ?? '',
      csvEscape(t.thought_listing_text),
      person.knowledge_score ?? '',
      person.knowledge_possessor ?? '',
    ].join(',')
  );
  downloadBlob(
    `paper2_${person.participant_id}_trials.csv`,
    '\uFEFF' + [header.join(','), ...rows].join('\n'),
    'text/csv;charset=utf-8'
  );
}

export function exportPersonCsv(person: PersonRecord) {
  const header = [
    'participant_id',
    'study',
    'pilot',
    'condition_pressure',
    'condition_intervention',
    'randomization_seed',
    'knowledge_score',
    'knowledge_possessor',
    'confidence_score',
    'digital_literacy',
    'financial_literacy',
    'previous_fraud_exposure',
    'previous_victimization',
    'age_years',
    'gender',
    'education',
    'attention_pass',
    'urgency_check',
    'authority_check',
    'pressure_check',
    'realism_check',
    'comprehension_check',
    'hypothesis_awareness',
    'hypothesis_text',
    'duration_sec',
    'app_version',
    'device_type',
    'consent_at',
    'completed_at',
  ];
  const row = [
    person.participant_id,
    person.study,
    person.pilot ? 1 : 0,
    person.condition_pressure,
    person.condition_intervention,
    csvEscape(person.randomization_seed),
    person.knowledge_score ?? '',
    person.knowledge_possessor ?? '',
    person.confidence_score ?? '',
    person.digital_literacy ?? '',
    person.financial_literacy ?? '',
    person.previous_fraud_exposure ?? '',
    person.previous_victimization ?? '',
    person.age_years ?? '',
    person.gender ?? '',
    person.education ?? '',
    person.attention_pass ?? '',
    person.urgency_check ?? '',
    person.authority_check ?? '',
    person.pressure_check ?? '',
    person.realism_check ?? '',
    person.comprehension_check ?? '',
    person.hypothesis_awareness ?? '',
    csvEscape(person.hypothesis_text ?? ''),
    person.duration_sec ?? '',
    person.app_version ?? '',
    person.device_type,
    person.consent_at ?? '',
    person.completed_at ?? '',
  ];
  downloadBlob(
    `paper2_${person.participant_id}_person.csv`,
    '\uFEFF' + [header.join(','), row.join(',')].join('\n'),
    'text/csv;charset=utf-8'
  );
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const STORAGE_KEY = 'paper2_research_session_v2';

export function persistPerson(person: PersonRecord) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(person));
  } catch {
    /* ignore quota */
  }
}

export function loadPersistedPerson(): PersonRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('paper2_research_session_v1');
    return raw ? (JSON.parse(raw) as PersonRecord) : null;
  } catch {
    return null;
  }
}

export function clearPersistedPerson() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('paper2_research_session_v1');
}

/** Lightweight structural validation for downloaded JSON (also used by Complete screen). */
export function validatePerson(person: PersonRecord): string[] {
  const errors: string[] = [];
  if (!person.participant_id) errors.push('нет participant_id');
  if (![1, 2].includes(person.study)) errors.push('study должен быть 1 или 2');
  if (!['control', 'urgency', 'authority'].includes(person.condition_pressure)) {
    errors.push('некорректный condition_pressure');
  }
  if (!['none', 'pause_verify'].includes(person.condition_intervention)) {
    errors.push('некорректный condition_intervention');
  }
  if (person.study === 1 && person.condition_intervention !== 'none') {
    errors.push('Study 1: intervention должен быть none');
  }
  if (!person.trials?.length) errors.push('нет trials');
  for (const t of person.trials ?? []) {
    if (!t.action_code) errors.push(`trial ${t.scenario_id}: нет action_code`);
    if (t.verification_behavior == null) errors.push(`trial ${t.scenario_id}: нет verification_behavior`);
  }
  if (person.completed_at && person.hypothesis_text === undefined) {
    errors.push('нет hypothesis_text');
  }
  return errors;
}
