import type { ReactNode } from 'react';
import { COPY } from '../data/copy';
import { useResearchStore } from '../store';

/** SPbU-inspired research chrome: light academic, crimson + gold, герб. */
export function ResearchShell({ children, title }: { children: ReactNode; title?: string }) {
  const { person, phase, trialIndex } = useResearchStore();
  const trialTotal = person.trials.length;
  const showProgress = phase === 'trial' || phase === 'thought' || phase === 'trial_ratings';

  return (
    <div className="min-h-screen text-[#1a1a1a]" style={{ background: 'linear-gradient(180deg, #f4f1ea 0%, #ebe6dc 100%)' }}>
      <header className="sticky top-0 z-20 border-b border-[#8B1E3F]/30 bg-white/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/img/spbu_gerb.png"
              alt="Герб Санкт-Петербургского государственного университета"
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium tracking-wide uppercase text-[#8B1E3F]">
                {COPY.institution}
              </p>
              <h1 className="text-sm sm:text-base font-semibold text-[#1a1a1a] leading-snug truncate">
                {title ?? COPY.appTitle}
              </h1>
            </div>
          </div>
          {showProgress && (
            <span className="text-xs text-[#5c5c5c] whitespace-nowrap bg-[#f4f1ea] border border-[#d9d2c5] rounded-full px-3 py-1">
              {trialIndex + 1} / {trialTotal}
            </span>
          )}
        </div>
        <div className="h-1 w-full bg-[#c9a227]/40">
          <div className="h-full bg-[#8B1E3F]" style={{ width: phaseProgress(phase, trialIndex, trialTotal) }} />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">{children}</main>
      <footer className="max-w-2xl mx-auto px-4 pb-8 text-center text-[11px] text-[#7a7368]">
        Научное исследование · обезличенные данные · без сбора паролей и данных карт
      </footer>
    </div>
  );
}

function phaseProgress(phase: string, trialIndex: number, trialTotal: number): string {
  const map: Record<string, number> = {
    consent: 5,
    baseline: 20,
    filler: 35,
    trial: 40 + (trialIndex / Math.max(trialTotal, 1)) * 40,
    thought: 45 + (trialIndex / Math.max(trialTotal, 1)) * 40,
    trial_ratings: 48 + (trialIndex / Math.max(trialTotal, 1)) * 40,
    manip_checks: 88,
    debrief: 95,
    complete: 100,
  };
  return `${Math.min(100, Math.round(map[phase] ?? 10))}%`;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#d9d2c5] bg-white p-5 sm:p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full sm:w-auto min-w-[12rem] rounded-xl bg-[#8B1E3F] hover:bg-[#6f1732] disabled:bg-[#cbbfb0] disabled:text-[#8a8278] text-white font-semibold px-6 py-3 transition shadow-sm"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-[#8B1E3F]/40 text-[#8B1E3F] hover:bg-[#8B1E3F]/5 font-medium px-5 py-3 text-sm transition"
    >
      {children}
    </button>
  );
}

export function Scale7({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (n: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-[#1a1a1a]">{label}</p>
      <p className="text-xs text-[#7a7368]">{COPY.scaleHint}</p>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-10 w-10 rounded-lg border text-sm font-medium ${
              value === n
                ? 'border-[#8B1E3F] bg-[#8B1E3F] text-white'
                : 'border-[#d9d2c5] bg-[#faf8f4] text-[#1a1a1a] hover:border-[#8B1E3F]/50'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChoiceList({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition ${
            value === o.value
              ? 'border-[#8B1E3F] bg-[#8B1E3F]/8 text-[#1a1a1a] ring-1 ring-[#8B1E3F]/30'
              : 'border-[#d9d2c5] bg-[#faf8f4] hover:border-[#8B1E3F]/40'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
