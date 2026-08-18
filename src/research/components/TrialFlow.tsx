import { useEffect, useMemo, useState } from 'react';
import { COPY } from '../data/copy';
import {
  ACTION_OPTIONS,
  INTERVENTION_DWELL_MS,
  SCENARIOS,
  URGENCY_SECONDS,
} from '../data/measures';
import {
  clearPersistedPerson,
  exportPersonCsv,
  exportPersonJson,
  exportTrialsCsv,
  validatePerson,
} from '../exportData';
import { shuffleInPlace } from '../randomize';
import { useResearchStore } from '../store';
import { syncPersonToSupabase, type SyncResult } from '../syncToCloud';
import type { ActionCode } from '../types';
import { Card, PrimaryButton, ResearchShell, Scale7, SecondaryButton } from './ui';

function useShuffledActions(seed: string, trialIndex: number) {
  return useMemo(
    () => shuffleInPlace(ACTION_OPTIONS, `${seed}:actions:${trialIndex}`),
    [seed, trialIndex]
  );
}

export function ScenarioTrialScreen() {
  const {
    person,
    trialIndex,
    interventionDone,
    markScenarioShown,
    markInterventionDone,
    markTimeout,
    chooseAction,
    currentScenarioId,
  } = useResearchStore();

  const scenario = SCENARIOS.find((s) => s.id === currentScenarioId()) ?? SCENARIOS[0];
  const pressure = person.condition_pressure;
  const intervention = person.condition_intervention;
  const needsGate = true; // matched 5s wait for both arms
  const [gateDone, setGateDone] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(URGENCY_SECONDS);
  const actions = useShuffledActions(person.randomization_seed, trialIndex);

  useEffect(() => {
    setGateDone(false);
    setSecondsLeft(URGENCY_SECONDS);
    markScenarioShown();
    const t = window.setTimeout(() => {
      setGateDone(true);
      markInterventionDone();
    }, INTERVENTION_DWELL_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialIndex]);

  useEffect(() => {
    if (pressure !== 'urgency' || !gateDone) return;
    setSecondsLeft(URGENCY_SECONDS);
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          markTimeout();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pressure, gateDone, trialIndex]);

  const sender =
    pressure === 'authority'
      ? `${COPY.senderAuthorityPrefix} · ${scenario.domain}`
      : scenario.domain;

  const banner =
    pressure === 'urgency'
      ? COPY.urgencyBanner
      : pressure === 'authority'
        ? COPY.authorityBanner
        : COPY.controlBanner;

  if (needsGate && !gateDone) {
    const showIntervention = intervention === 'pause_verify';
    return (
      <ResearchShell>
        <Card className="space-y-4 min-h-[220px] flex flex-col justify-center">
          {showIntervention ? (
            <>
              <h2 className="text-lg font-semibold text-[#8B1E3F]">{COPY.interventionTitle}</h2>
              {COPY.interventionLines.map((line) => (
                <p key={line} className="text-[#1a1a1a] leading-relaxed">
                  {line}
                </p>
              ))}
            </>
          ) : (
            <p className="text-[#7a7368] text-center animate-pulse">{COPY.loaderNeutral}</p>
          )}
          <p className="text-xs text-[#9a9286] text-center">Подождите несколько секунд…</p>
        </Card>
      </ResearchShell>
    );
  }

  return (
    <ResearchShell>
      <div className="space-y-4">
        {trialIndex === 0 && <p className="text-sm text-[#5c5c5c]">{COPY.trialIntro}</p>}
        <Card
          className={`space-y-3 ${
            pressure === 'authority' ? 'border-[#8B1E3F]/50 ring-1 ring-[#8B1E3F]/15' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#7a7368]">Отправитель</p>
              <p className={`font-medium ${pressure === 'authority' ? 'text-[#8B1E3F]' : 'text-[#1a1a1a]'}`}>
                {sender}
              </p>
            </div>
            {pressure === 'urgency' && (
              <div className="text-right">
                <p className="text-xs text-[#b42318]">{COPY.timerLabel}</p>
                <p className="text-2xl font-bold text-[#b42318] tabular-nums">{secondsLeft}</p>
              </div>
            )}
          </div>
          <p className="text-sm text-[#6f1732]">{banner}</p>
          <p className="text-[#1a1a1a] leading-relaxed">{scenario.body}</p>
          <p className="font-medium text-[#1a1a1a]">{scenario.requestLine}</p>
          {pressure === 'urgency' && secondsLeft === 0 && (
            <p className="text-xs text-[#b42318]">{COPY.timerExpired}</p>
          )}
        </Card>

        <Card className="space-y-3">
          <p className="text-sm font-medium text-[#1a1a1a]">{COPY.chooseAction}</p>
          <div className="space-y-2">
            {actions.map((a) => (
              <button
                key={a.code}
                type="button"
                onClick={() => chooseAction(a.code as ActionCode)}
                className="w-full text-left rounded-xl border border-[#d9d2c5] bg-[#faf8f4] hover:border-[#8B1E3F]/60 hover:bg-white px-4 py-3 text-sm leading-snug text-[#1a1a1a]"
              >
                {a.label}
              </button>
            ))}
          </div>
        </Card>
        <span className="sr-only">{interventionDone ? 'ready' : 'wait'}</span>
      </div>
    </ResearchShell>
  );
}

export function ThoughtListingScreen() {
  const setThought = useResearchStore((s) => s.setThought);
  const [text, setText] = useState('');

  return (
    <ResearchShell title={COPY.thoughtTitle}>
      <Card className="space-y-4">
        <p className="text-sm text-[#3d3d3d] leading-relaxed">{COPY.thoughtPrompt}</p>
        <textarea
          className="w-full min-h-[160px] rounded-xl border border-[#d9d2c5] bg-[#faf8f4] px-3.5 py-3 text-[16px] text-[#1a1a1a] leading-relaxed"
          placeholder={COPY.thoughtPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <PrimaryButton disabled={text.trim().length < 3} onClick={() => setThought(text.trim())}>
          {COPY.continue}
        </PrimaryButton>
      </Card>
    </ResearchShell>
  );
}

export function TrialRatingsScreen() {
  const setTrialRatings = useResearchStore((s) => s.setTrialRatings);
  const [suspicion, setSuspicion] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  return (
    <ResearchShell>
      <Card className="space-y-5">
        <Scale7 label={COPY.suspicion} value={suspicion} onChange={setSuspicion} />
        <Scale7 label={COPY.decisionConfidence} value={confidence} onChange={setConfidence} />
        <PrimaryButton
          disabled={suspicion == null || confidence == null}
          onClick={() => setTrialRatings(suspicion!, confidence!)}
        >
          {COPY.continue}
        </PrimaryButton>
      </Card>
    </ResearchShell>
  );
}

export function ManipChecksScreen() {
  const setManipChecks = useResearchStore((s) => s.setManipChecks);
  const [urgency, setUrgency] = useState<number | null>(null);
  const [authority, setAuthority] = useState<number | null>(null);
  const [pressure, setPressure] = useState<number | null>(null);
  const [realism, setRealism] = useState<number | null>(null);
  const [comprehension, setComprehension] = useState<number | null>(null);
  const [hypothesis, setHypothesis] = useState('');

  const ready =
    urgency != null &&
    authority != null &&
    pressure != null &&
    realism != null &&
    comprehension != null;

  return (
    <ResearchShell title={COPY.manipTitle}>
      <Card className="space-y-5">
        <Scale7 label={COPY.urgencyCheck} value={urgency} onChange={setUrgency} />
        <Scale7 label={COPY.authorityCheck} value={authority} onChange={setAuthority} />
        <Scale7 label={COPY.pressureCheck} value={pressure} onChange={setPressure} />
        <Scale7 label={COPY.realismCheck} value={realism} onChange={setRealism} />
        <Scale7 label={COPY.comprehensionCheck} value={comprehension} onChange={setComprehension} />
        <label className="block space-y-2 text-sm">
          <span>{COPY.hypothesisPrompt}</span>
          <textarea
            className="w-full min-h-[96px] rounded-xl border border-[#d9d2c5] bg-[#faf8f4] px-3.5 py-3 text-[16px] text-[#1a1a1a] leading-relaxed"
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
          />
        </label>
        <PrimaryButton
          disabled={!ready}
          onClick={() =>
            setManipChecks({
              urgency_check: urgency!,
              authority_check: authority!,
              pressure_check: pressure!,
              realism_check: realism!,
              comprehension_check: comprehension!,
              hypothesis_text: hypothesis,
            })
          }
        >
          {COPY.continue}
        </PrimaryButton>
      </Card>
    </ResearchShell>
  );
}

export function DebriefScreen() {
  const finishDebrief = useResearchStore((s) => s.finishDebrief);
  return (
    <ResearchShell title={COPY.debriefTitle}>
      <Card className="space-y-4">
        {COPY.debriefBody.map((p) => (
          <p key={p} className="text-sm text-[#1a1a1a] leading-relaxed">
            {p}
          </p>
        ))}
        <p className="text-sm text-[#5c5c5c]">{COPY.debriefResource}</p>
        <p className="text-sm text-[#5c5c5c]">{COPY.debriefContact}</p>
        <PrimaryButton onClick={finishDebrief}>{COPY.continue}</PrimaryButton>
      </Card>
    </ResearchShell>
  );
}

export function CompleteScreen() {
  const person = useResearchStore((s) => s.person);
  const [sync, setSync] = useState<SyncResult | null>(null);
  const [syncing, setSyncing] = useState(false);
  const researcherView =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1';

  const upload = async () => {
    setSyncing(true);
    const result = await syncPersonToSupabase(person);
    setSync(result);
    setSyncing(false);
  };

  useEffect(() => {
    void upload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person.participant_id, person.completed_at]);

  return (
    <ResearchShell title={COPY.completeTitle}>
      <Card className="space-y-5">
        <div className="flex items-center gap-3 pb-2 border-b border-[#d9d2c5]">
          <img
            src={`${import.meta.env.BASE_URL}img/spbu_gerb.png`}
            alt="Герб СПбГУ"
            className="h-12 w-12 sm:h-14 sm:w-14 object-contain flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-[#8B1E3F]">{COPY.institutionShort}</p>
            <p className="font-semibold text-lg">{COPY.completeTitle}</p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-[#3d3d3d] leading-relaxed">{COPY.completeBody}</p>

        <div
          className={`rounded-xl border px-4 py-3.5 text-sm sm:text-[15px] leading-snug ${
            syncing
              ? 'border-[#d9d2c5] bg-[#faf8f4] text-[#5c5c5c]'
              : sync?.ok
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-medium'
                : 'border-amber-300 bg-amber-50 text-amber-950'
          }`}
        >
          {syncing && <p>{COPY.completeSaving}</p>}
          {!syncing && sync?.ok && <p>{COPY.completeSaved}</p>}
          {!syncing && sync && !sync.ok && (
            <div className="space-y-3">
              <p>{COPY.completeSaveFailed}</p>
              <SecondaryButton onClick={() => void upload()}>{COPY.completeRetry}</SecondaryButton>
              {researcherView && <p className="text-xs opacity-80 break-words">{sync.message}</p>}
            </div>
          )}
        </div>

        {researcherView && (
          <div className="space-y-3 pt-2 border-t border-dashed border-[#d9d2c5]">
            <p className="text-xs text-[#7a7368]">Режим исследователя (?debug=1)</p>
            <p className="text-xs text-[#7a7368] break-all">ID: {person.participant_id}</p>
            <p className="text-xs text-[#7a7368]">
              {person.condition_pressure} / {person.condition_intervention} · Study {person.study}
              {person.pilot ? ' · pilot' : ''}
              {person.duration_sec != null ? ` · ${Math.round(person.duration_sec / 60)} мин` : ''}
            </p>
            {validatePerson(person).length === 0 ? (
              <p className="text-xs text-emerald-800">Структура: participant + 4 trials OK</p>
            ) : (
              <ul className="text-xs text-amber-900 list-disc pl-4">
                {validatePerson(person).map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-2">
              <PrimaryButton onClick={() => exportPersonJson(person)}>{COPY.downloadJson}</PrimaryButton>
              <PrimaryButton onClick={() => exportTrialsCsv(person)}>{COPY.downloadCsv}</PrimaryButton>
              <PrimaryButton onClick={() => exportPersonCsv(person)}>{COPY.downloadPerson}</PrimaryButton>
            </div>
            <SecondaryButton
              onClick={() => {
                clearPersistedPerson();
                window.location.href = `${window.location.pathname}?research=1&study=${person.study}${person.pilot ? '&pilot=1' : ''}&debug=1`;
              }}
            >
              Начать новую сессию
            </SecondaryButton>
          </div>
        )}
      </Card>
    </ResearchShell>
  );
}
