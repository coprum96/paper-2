import { create } from 'zustand';
import { DIGITAL_LITERACY, FINANCIAL_LITERACY, KNOWLEDGE_ITEMS, SCENARIOS } from './data/measures';
import {
  codeAction,
  loadPersistedPerson,
  persistPerson,
  scoreDigitalLiteracy,
  scoreFinancialLiteracy,
  scoreKnowledge,
} from './exportData';
import { assignConditions, detectDeviceType, newParticipantId, parseResearchParams } from './randomize';
import type { ActionCode, PersonRecord, ResearchPhase, TrialRecord } from './types';

function emptyKnowledge(): PersonRecord['knowledge_answers'] {
  return Object.fromEntries(KNOWLEDGE_ITEMS.map((k) => [k.id, null]));
}

function emptyDl(): PersonRecord['digital_literacy_items'] {
  return Object.fromEntries(DIGITAL_LITERACY.map((d) => [d.id, null]));
}

function emptyFl(): PersonRecord['financial_literacy_answers'] {
  return Object.fromEntries(FINANCIAL_LITERACY.map((f) => [f.id, null]));
}

function emptyTrial(scenarioId: string, order: number): TrialRecord {
  return {
    scenario_id: scenarioId,
    scenario_order: order,
    action_code: null,
    verification_behavior: null,
    safe_choice: null,
    response_latency_ms: null,
    thought_listing_text: '',
    suspicion: null,
    decision_confidence: null,
    timeout_flag: 0,
    scenario_shown_at: null,
  };
}

function bootstrap(): { phase: ResearchPhase; person: PersonRecord; trialIndex: number; baselineStep: number } {
  const { study, pilot } = parseResearchParams();
  const existing = loadPersistedPerson();
  if (existing && existing.study === study && !existing.completed_at) {
    const idx = existing.trials.findIndex((t) => t.action_code === null);
    const person: PersonRecord = {
      ...existing,
      hypothesis_text: existing.hypothesis_text ?? '',
      duration_sec: existing.duration_sec ?? null,
      app_version: existing.app_version ?? 'paper2-research-0.2.0',
    };
    return {
      phase: existing.consent_at ? (idx === -1 ? 'manip_checks' : 'trial') : 'consent',
      person,
      trialIndex: idx === -1 ? Math.max(0, existing.trials.length - 1) : idx,
      baselineStep: 0,
    };
  }

  const participant_id = newParticipantId();
  const { pressure, intervention, seed, scenarioOrder } = assignConditions(participant_id, study);
  const person: PersonRecord = {
    participant_id,
    study,
    pilot,
    condition_pressure: pressure,
    condition_intervention: study === 1 ? 'none' : intervention,
    randomization_seed: seed,
    knowledge_answers: emptyKnowledge(),
    knowledge_score: null,
    knowledge_possessor: null,
    confidence_score: null,
    digital_literacy_items: emptyDl(),
    digital_literacy: null,
    financial_literacy_answers: emptyFl(),
    financial_literacy: null,
    previous_fraud_exposure: null,
    previous_victimization: null,
    age_years: null,
    gender: null,
    education: null,
    attention_1: null,
    attention_2: null,
    attention_pass: null,
    urgency_check: null,
    authority_check: null,
    pressure_check: null,
    realism_check: null,
    comprehension_check: null,
    hypothesis_awareness: null,
    hypothesis_text: '',
    device_type: detectDeviceType(),
    consent_at: null,
    completed_at: null,
    duration_sec: null,
    app_version: 'paper2-research-0.2.0',
    scenario_order: scenarioOrder,
    trials: scenarioOrder.map((id, i) => emptyTrial(id, i + 1)),
  };
  return { phase: 'consent', person, trialIndex: 0, baselineStep: 0 };
}

interface ResearchState {
  phase: ResearchPhase;
  person: PersonRecord;
  trialIndex: number;
  baselineStep: number;
  interventionDone: boolean;
  setPhase: (p: ResearchPhase) => void;
  setBaselineStep: (n: number) => void;
  patchPerson: (partial: Partial<PersonRecord>) => void;
  acceptConsent: () => void;
  finishBaseline: () => void;
  finishFiller: () => void;
  markScenarioShown: () => void;
  markInterventionDone: () => void;
  markTimeout: () => void;
  chooseAction: (code: ActionCode) => void;
  setThought: (text: string) => void;
  setTrialRatings: (suspicion: number, confidence: number) => void;
  advanceAfterTrial: () => void;
  setManipChecks: (vals: {
    urgency_check: number;
    authority_check: number;
    pressure_check: number;
    realism_check: number;
    comprehension_check: number;
    hypothesis_text: string;
  }) => void;
  finishDebrief: () => void;
  currentScenarioId: () => string;
  wantsThoughtListing: () => boolean;
}

function save(person: PersonRecord) {
  persistPerson(person);
}

const boot = bootstrap();

export const useResearchStore = create<ResearchState>((set, get) => ({
  phase: boot.phase,
  person: boot.person,
  trialIndex: boot.trialIndex,
  baselineStep: boot.baselineStep,
  interventionDone: false,

  setPhase: (phase) => set({ phase }),
  setBaselineStep: (baselineStep) => set({ baselineStep }),

  patchPerson: (partial) => {
    const person = { ...get().person, ...partial };
    save(person);
    set({ person });
  },

  acceptConsent: () => {
    const person = { ...get().person, consent_at: new Date().toISOString() };
    save(person);
    set({ person, phase: 'baseline', baselineStep: 0 });
  },

  finishBaseline: () => {
    const p = get().person;
    const k = scoreKnowledge(p.knowledge_answers);
    const person: PersonRecord = {
      ...p,
      knowledge_score: k.score,
      knowledge_possessor: k.possessor,
      digital_literacy: scoreDigitalLiteracy(p.digital_literacy_items),
      financial_literacy: scoreFinancialLiteracy(p.financial_literacy_answers),
      attention_pass: p.attention_1 && p.attention_2 ? 1 : 0,
    };
    save(person);
    set({ person, phase: 'filler' });
  },

  finishFiller: () => set({ phase: 'trial', trialIndex: 0, interventionDone: false }),

  markScenarioShown: () => {
    const { person, trialIndex } = get();
    const trials = person.trials.map((t, i) =>
      i === trialIndex ? { ...t, scenario_shown_at: t.scenario_shown_at ?? Date.now() } : t
    );
    const next = { ...person, trials };
    save(next);
    set({ person: next, interventionDone: false });
  },

  markInterventionDone: () => set({ interventionDone: true }),

  markTimeout: () => {
    const { person, trialIndex } = get();
    const trials = person.trials.map((t, i) => (i === trialIndex ? { ...t, timeout_flag: 1 as const } : t));
    const next = { ...person, trials };
    save(next);
    set({ person: next });
  },

  chooseAction: (code) => {
    const { person, trialIndex } = get();
    const coded = codeAction(code);
    const trials = person.trials.map((t, i) => {
      if (i !== trialIndex) return t;
      const shown = t.scenario_shown_at ?? Date.now();
      return {
        ...t,
        action_code: code,
        ...coded,
        response_latency_ms: Date.now() - shown,
      };
    });
    const next = { ...person, trials };
    save(next);
    const wantsThought = get().wantsThoughtListing();
    set({
      person: next,
      phase: wantsThought ? 'thought' : 'trial_ratings',
    });
  },

  setThought: (text) => {
    const { person, trialIndex } = get();
    const trials = person.trials.map((t, i) =>
      i === trialIndex ? { ...t, thought_listing_text: text } : t
    );
    const next = { ...person, trials };
    save(next);
    set({ person: next, phase: 'trial_ratings' });
  },

  setTrialRatings: (suspicion, decision_confidence) => {
    const { person, trialIndex } = get();
    const trials = person.trials.map((t, i) =>
      i === trialIndex ? { ...t, suspicion, decision_confidence } : t
    );
    const next = { ...person, trials };
    save(next);
    set({ person: next });
    get().advanceAfterTrial();
  },

  advanceAfterTrial: () => {
    const { trialIndex, person } = get();
    if (trialIndex + 1 < person.trials.length) {
      set({ trialIndex: trialIndex + 1, phase: 'trial', interventionDone: false });
    } else {
      set({ phase: 'manip_checks' });
    }
  },

  setManipChecks: (vals) => {
    const aware =
      /мошен|фрод|обман|активац|проверк|срочн|авторитет|давлен/i.test(vals.hypothesis_text) ? 1 : 0;
    const person: PersonRecord = {
      ...get().person,
      urgency_check: vals.urgency_check,
      authority_check: vals.authority_check,
      pressure_check: vals.pressure_check,
      realism_check: vals.realism_check,
      comprehension_check: vals.comprehension_check,
      hypothesis_awareness: aware as 0 | 1,
      hypothesis_text: vals.hypothesis_text.trim(),
    };
    save(person);
    set({ person, phase: 'debrief' });
  },

  finishDebrief: () => {
    const prev = get().person;
    const start = prev.consent_at ? Date.parse(prev.consent_at) : NaN;
    const completed_at = new Date().toISOString();
    const duration_sec = Number.isFinite(start)
      ? Math.max(0, Math.round((Date.parse(completed_at) - start) / 1000))
      : null;
    const person = { ...prev, completed_at, duration_sec };
    save(person);
    set({ person, phase: 'complete' });
  },

  currentScenarioId: () => {
    const { person, trialIndex } = get();
    return person.scenario_order[trialIndex] ?? SCENARIOS[0].id;
  },

  wantsThoughtListing: () => {
    const { person } = get();
    return person.study === 1 || person.pilot;
  },
}));
