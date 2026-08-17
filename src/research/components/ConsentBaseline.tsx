import { useMemo, useState } from 'react';
import { COPY } from '../data/copy';
import {
  DIGITAL_LITERACY,
  FINANCIAL_LITERACY,
  KNOWLEDGE_ITEMS,
} from '../data/measures';
import { useResearchStore } from '../store';
import { Card, ChoiceList, PrimaryButton, ResearchShell, Scale7 } from './ui';

export function ConsentScreen() {
  const acceptConsent = useResearchStore((s) => s.acceptConsent);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const allOk = COPY.consentChecks.every((c) => checks[c.id]);

  return (
    <ResearchShell>
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-[#8B1E3F]">{COPY.consentTitle}</h2>
        <p className="text-[#3d3d3d] text-sm leading-relaxed">{COPY.consentIntro}</p>
        <ul className="list-disc pl-5 text-sm text-[#3d3d3d] space-y-1">
          {COPY.consentBullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div className="space-y-3 pt-2">
          {COPY.consentChecks.map((c) => (
            <label key={c.id} className="flex gap-3 items-start text-sm text-[#1a1a1a] cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 accent-[#8B1E3F]"
                checked={!!checks[c.id]}
                onChange={(e) => setChecks((prev) => ({ ...prev, [c.id]: e.target.checked }))}
              />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
        <div className="pt-2">
          <PrimaryButton disabled={!allOk} onClick={acceptConsent}>
            {COPY.continue}
          </PrimaryButton>
        </div>
      </Card>
    </ResearchShell>
  );
}

export function BaselineScreen() {
  const { person, baselineStep, setBaselineStep, patchPerson, finishBaseline } = useResearchStore();
  const step = baselineStep;

  const next = () => {
    if (step < 5) setBaselineStep(step + 1);
    else finishBaseline();
  };
  const back = () => setBaselineStep(Math.max(0, step - 1));

  const canNext = useMemo(() => {
    if (step === 0) return KNOWLEDGE_ITEMS.every((k) => person.knowledge_answers[k.id]);
    if (step === 1) return person.confidence_score != null && DIGITAL_LITERACY.every((d) => person.digital_literacy_items[d.id] != null);
    if (step === 2) return FINANCIAL_LITERACY.every((f) => person.financial_literacy_answers[f.id]);
    if (step === 3) {
      if (person.previous_fraud_exposure == null) return false;
      if (person.previous_fraud_exposure === 1 && person.previous_victimization == null) return false;
      return true;
    }
    if (step === 4) {
      return (
        person.age_years != null &&
        person.age_years >= 18 &&
        !!person.gender &&
        !!person.education &&
        person.attention_1 !== null &&
        person.attention_2 !== null
      );
    }
    return true;
  }, [step, person]);

  return (
    <ResearchShell title={`${COPY.baselineTitle} (${step + 1}/6)`}>
      <Card className="space-y-5">
        {step === 0 && (
          <>
            <p className="text-sm text-[#3d3d3d]">{COPY.knowledgeIntro}</p>
            {KNOWLEDGE_ITEMS.map((item) => (
              <div key={item.id} className="space-y-2 border-t border-[#ebe6dc] pt-4">
                <p className="text-sm text-[#1a1a1a]">
                  <span className="text-[#8B1E3F] mr-2 font-medium">{item.id}</span>
                  {item.stem}
                </p>
                <ChoiceList
                  value={person.knowledge_answers[item.id]}
                  onChange={(v) =>
                    patchPerson({
                      knowledge_answers: {
                        ...person.knowledge_answers,
                        [item.id]: v as 'true' | 'false' | 'dk',
                      },
                    })
                  }
                  options={[
                    { value: 'true', label: COPY.true },
                    { value: 'false', label: COPY.false },
                    { value: 'dk', label: COPY.dk },
                  ]}
                />
              </div>
            ))}
          </>
        )}

        {step === 1 && (
          <>
            <Scale7
              label={COPY.confidence}
              value={person.confidence_score}
              onChange={(n) => patchPerson({ confidence_score: n })}
            />
            <p className="text-sm text-[#3d3d3d] pt-2">{COPY.dlIntro}</p>
            {DIGITAL_LITERACY.map((d) => (
              <div key={d.id} className="space-y-2">
                <p className="text-sm text-[#1a1a1a]">{d.stem}</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        patchPerson({
                          digital_literacy_items: { ...person.digital_literacy_items, [d.id]: n },
                        })
                      }
                      className={`h-9 w-9 rounded-lg border text-sm ${
                        person.digital_literacy_items[d.id] === n
                          ? 'border-[#8B1E3F] bg-[#8B1E3F] text-white'
                          : 'border-[#d9d2c5] bg-[#faf8f4]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-[#3d3d3d]">{COPY.flIntro}</p>
            {FINANCIAL_LITERACY.map((f) => (
              <div key={f.id} className="space-y-2 border-t border-[#ebe6dc] pt-4">
                <p className="text-sm text-[#1a1a1a]">{f.stem}</p>
                <ChoiceList
                  value={person.financial_literacy_answers[f.id]}
                  onChange={(v) =>
                    patchPerson({
                      financial_literacy_answers: { ...person.financial_literacy_answers, [f.id]: v },
                    })
                  }
                  options={f.options.map((o) => ({ value: o.value, label: o.label }))}
                />
              </div>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm">{COPY.exposure}</p>
            <ChoiceList
              value={
                person.previous_fraud_exposure == null ? null : String(person.previous_fraud_exposure)
              }
              onChange={(v) => {
                const n = Number(v) as 0 | 1 | 98;
                patchPerson({
                  previous_fraud_exposure: n,
                  previous_victimization: n === 1 ? person.previous_victimization : null,
                });
              }}
              options={[
                { value: '1', label: COPY.yes },
                { value: '0', label: COPY.no },
                { value: '98', label: COPY.preferNot },
              ]}
            />
            {person.previous_fraud_exposure === 1 && (
              <>
                <p className="text-sm pt-2">{COPY.victimization}</p>
                <ChoiceList
                  value={
                    person.previous_victimization == null
                      ? null
                      : String(person.previous_victimization)
                  }
                  onChange={(v) => patchPerson({ previous_victimization: Number(v) as 0 | 1 | 98 })}
                  options={[
                    { value: '1', label: COPY.yes },
                    { value: '0', label: COPY.no },
                    { value: '98', label: COPY.preferNot },
                  ]}
                />
              </>
            )}
          </>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <label className="block text-sm space-y-1">
              <span>{COPY.age}</span>
              <input
                type="number"
                min={18}
                max={120}
                className="w-full rounded-xl border border-[#d9d2c5] bg-[#faf8f4] px-3 py-2 text-[#1a1a1a]"
                value={person.age_years ?? ''}
                onChange={(e) =>
                  patchPerson({ age_years: e.target.value ? Number(e.target.value) : null })
                }
              />
            </label>
            <div>
              <p className="text-sm mb-2">{COPY.gender}</p>
              <ChoiceList
                value={person.gender}
                onChange={(v) => patchPerson({ gender: v })}
                options={[...COPY.genderOpts]}
              />
            </div>
            <div>
              <p className="text-sm mb-2">{COPY.education}</p>
              <ChoiceList
                value={person.education}
                onChange={(v) => patchPerson({ education: v })}
                options={[...COPY.educationOpts]}
              />
            </div>
            <div>
              <p className="text-sm mb-2">{COPY.attention1}</p>
              <ChoiceList
                value={
                  person.attention_1 === true ? 'three' : person.attention_1 === false ? 'one' : null
                }
                onChange={(v) => patchPerson({ attention_1: v === 'three' })}
                options={COPY.attention1Opts.map((o) => ({ value: o.value, label: o.label }))}
              />
            </div>
            <div>
              <p className="text-sm mb-2">{COPY.attention2}</p>
              <ChoiceList
                value={person.attention_2 === true ? '7' : person.attention_2 === false ? '3' : null}
                onChange={(v) => patchPerson({ attention_2: v === '7' })}
                options={COPY.attention2Opts.map((o) => ({ value: o.value, label: o.label }))}
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <p className="text-sm text-[#3d3d3d] leading-relaxed">
            Дальше — короткий нейтральный блок, затем несколько сообщений о вымышленных сервисах. Выберите
            действие так, как поступили бы обычно.
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          {step > 0 && (
            <button type="button" className="text-sm text-[#8B1E3F] underline" onClick={back}>
              {COPY.back}
            </button>
          )}
          <PrimaryButton disabled={!canNext && step < 5} onClick={next}>
            {COPY.continue}
          </PrimaryButton>
        </div>
      </Card>
    </ResearchShell>
  );
}

export function FillerScreen() {
  const finishFiller = useResearchStore((s) => s.finishFiller);
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);

  return (
    <ResearchShell title={COPY.fillerTitle}>
      <Card className="space-y-5">
        <p className="text-sm text-[#3d3d3d]">{COPY.fillerBody}</p>
        <div>
          <p className="text-sm mb-2">{COPY.fillerQ1}</p>
          <ChoiceList
            value={q1}
            onChange={setQ1}
            options={COPY.fillerQ1Opts.map((l) => ({ value: l, label: l }))}
          />
        </div>
        <div>
          <p className="text-sm mb-2">{COPY.fillerQ2}</p>
          <ChoiceList
            value={q2}
            onChange={setQ2}
            options={COPY.fillerQ2Opts.map((l) => ({ value: l, label: l }))}
          />
        </div>
        <PrimaryButton disabled={!q1 || !q2} onClick={finishFiller}>
          {COPY.continue}
        </PrimaryButton>
      </Card>
    </ResearchShell>
  );
}
