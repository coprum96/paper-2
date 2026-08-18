/** Paper 2 research types — aligned with empiric_research data_dictionary.csv */

export type StudyId = 1 | 2;
export type Pressure = 'control' | 'urgency' | 'authority';
export type Intervention = 'none' | 'pause_verify';
export type ActionCode = 'V' | 'W' | 'R' | 'P' | 'C' | 'S';

export type ResearchPhase =
  | 'consent'
  | 'baseline'
  | 'filler'
  | 'trial'
  | 'thought'
  | 'trial_ratings'
  | 'manip_checks'
  | 'debrief'
  | 'complete';

export interface KnowledgeItem {
  id: string;
  stem: string;
  /** Correct answer: true = Верно, false = Неверно */
  key: boolean;
}

export interface ScenarioFrame {
  id: string;
  domain: string;
  /** App name on the fake lock-screen push */
  appName: string;
  /** Push title (short, like a real notification) */
  title: string;
  /** Neutral body shared across pressure cells */
  body: string;
  requestLine: string;
  amount: string;
  deadline: string;
  /** “We already know something about you” cue — fictional, not PII */
  knownLine: string;
  /** Optional second bubble in the same trial (still one choice) */
  followUp?: string;
}

export interface TrialRecord {
  scenario_id: string;
  scenario_order: number;
  action_code: ActionCode | null;
  verification_behavior: 0 | 1 | null;
  safe_choice: 0 | 1 | null;
  response_latency_ms: number | null;
  thought_listing_text: string;
  suspicion: number | null;
  decision_confidence: number | null;
  timeout_flag: 0 | 1;
  scenario_shown_at: number | null;
}

export interface PersonRecord {
  participant_id: string;
  study: StudyId;
  pilot: boolean;
  condition_pressure: Pressure;
  condition_intervention: Intervention;
  randomization_seed: string;
  knowledge_answers: Record<string, 'true' | 'false' | 'dk' | null>;
  knowledge_score: number | null;
  knowledge_possessor: 0 | 1 | null;
  confidence_score: number | null;
  digital_literacy_items: Record<string, number | null>;
  digital_literacy: number | null;
  financial_literacy_answers: Record<string, string | null>;
  financial_literacy: number | null;
  previous_fraud_exposure: 0 | 1 | 98 | null;
  previous_victimization: 0 | 1 | 98 | null;
  age_years: number | null;
  gender: string | null;
  education: string | null;
  attention_1: boolean | null;
  attention_2: boolean | null;
  attention_pass: 0 | 1 | null;
  urgency_check: number | null;
  authority_check: number | null;
  pressure_check: number | null;
  realism_check: number | null;
  comprehension_check: number | null;
  hypothesis_awareness: 0 | 1 | null;
  /** Raw funnel-debrief text; kept for coding (not only the binary flag). */
  hypothesis_text: string;
  device_type: string;
  consent_at: string | null;
  completed_at: string | null;
  /** Wall-clock seconds from consent to complete (derived). */
  duration_sec: number | null;
  app_version: string;
  scenario_order: string[];
  trials: TrialRecord[];
}
