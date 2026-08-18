import type { Intervention, Pressure, StudyId } from './types';
import { SCENARIOS } from './data/measures';

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function newParticipantId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `p_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function detectDeviceType(): string {
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function parseResearchParams(search = window.location.search): {
  enabled: boolean;
  study: StudyId;
  pilot: boolean;
  pressureOverride: Pressure | null;
} {
  const q = new URLSearchParams(search);
  const enabled =
    q.get('research') === '1' ||
    import.meta.env.VITE_RESEARCH_MODE === 'true' ||
    window.location.pathname.replace(/\/$/, '').endsWith('/research');
  const studyRaw = q.get('study');
  const study: StudyId = studyRaw === '1' ? 1 : 2;
  const pilot = q.get('pilot') === '1';
  const pressureRaw = q.get('pressure');
  const pressureOverride: Pressure | null =
    pressureRaw === 'control' || pressureRaw === 'urgency' || pressureRaw === 'authority'
      ? pressureRaw
      : null;
  return { enabled, study, pilot, pressureOverride };
}

/** Equal allocation across 3 pressure × (study2: 2 intervention) cells. */
export function assignConditions(
  participantId: string,
  study: StudyId
): { pressure: Pressure; intervention: Intervention; seed: string; scenarioOrder: string[] } {
  const seed = `${participantId}:${study}`;
  const rnd = mulberry32(hashSeed(seed));
  const pressures: Pressure[] = ['control', 'urgency', 'authority'];
  const pressure = pressures[Math.floor(rnd() * pressures.length)];
  const intervention: Intervention =
    study === 1 ? 'none' : rnd() < 0.5 ? 'none' : 'pause_verify';

  const ids = SCENARIOS.map((s) => s.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return { pressure, intervention, seed, scenarioOrder: ids };
}

export function shuffleInPlace<T>(arr: T[], seedText: string): T[] {
  const rnd = mulberry32(hashSeed(seedText));
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
