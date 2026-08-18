import type { ReactNode } from 'react';
import { COPY } from '../data/copy';
import { useResearchStore } from '../store';

const GERB_SRC = `${import.meta.env.BASE_URL}img/spbu_gerb.png`;

/** SPbU research chrome: light academic, crimson, герб, mobile-first. */
export function ResearchShell({ children, title }: { children: ReactNode; title?: string }) {
  const { person, phase, trialIndex } = useResearchStore();
  const trialTotal = person.trials.length;
  const showProgress = phase === 'trial' || phase === 'thought' || phase === 'trial_ratings';

  return (
    <div
      className="min-h-screen text-[#1a1a1a] research-shell"
      style={{
        background: 'linear-gradient(180deg, #f4f1ea 0%, #ebe6dc 100%)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <header
        className="sticky top-0 z-20 border-b border-[#8B1E3F]/25 bg-white/95 backdrop-blur"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <img
              src={GERB_SRC}
              alt="Герб СПбГУ"
              width={56}
              height={56}
              className="h-11 w-11 sm:h-14 sm:w-14 object-contain flex-shrink-0 mt-0.5 sm:mt-0"
              decoding="async"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold tracking-wide uppercase text-[#8B1E3F] leading-tight">
                <span className="sm:hidden">{COPY.institutionShort}</span>
                <span className="hidden sm:inline">{COPY.institution}</span>
              </p>
              <p className="text-[9px] sm:text-[11px] text-[#8B1E3F]/80 leading-tight mt-0.5">
                {COPY.labName}
              </p>
              <h1 className="text-[13px] sm:text-base font-semibold text-[#1a1a1a] leading-snug mt-0.5 break-words">
                {title ?? COPY.appTitle}
              </h1>
            </div>
          </div>
          {showProgress && (
            <span className="text-[11px] sm:text-xs text-[#5c5c5c] whitespace-nowrap bg-[#f4f1ea] border border-[#d9d2c5] rounded-full px-2.5 py-1 flex-shrink-0 mt-1 sm:mt-0">
              {trialIndex + 1}/{trialTotal}
            </span>
          )}
        </div>
        <div className="h-1 w-full bg-[#c9a227]/35">
          <div className="h-full bg-[#8B1E3F] transition-all" style={{ width: phaseProgress(phase, trialIndex, trialTotal) }} />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-8">{children}</main>
      <footer className="max-w-2xl mx-auto px-3 sm:px-4 pb-6 text-center text-[10px] sm:text-[11px] text-[#7a7368] leading-relaxed">
        {COPY.institutionShort} · {COPY.labName}
        <br />
        {COPY.appTitle} · обезличенные данные · без паролей и данных карт
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
    <div className={`rounded-2xl border border-[#d9d2c5] bg-white p-4 sm:p-6 shadow-sm ${className}`}>
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
      className="w-full rounded-xl bg-[#8B1E3F] hover:bg-[#6f1732] active:bg-[#5a1228] disabled:bg-[#cbbfb0] disabled:text-[#8a8278] text-white font-semibold px-5 py-3.5 sm:py-3 text-[15px] sm:text-base transition shadow-sm min-h-[48px]"
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
      className="w-full sm:w-auto rounded-xl border border-[#8B1E3F]/40 text-[#8B1E3F] hover:bg-[#8B1E3F]/5 active:bg-[#8B1E3F]/10 font-medium px-5 py-3.5 text-sm transition min-h-[48px]"
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
      <p className="text-sm text-[#1a1a1a] leading-snug">{label}</p>
      <p className="text-xs text-[#7a7368]">{COPY.scaleHint}</p>
      <div className="grid grid-cols-7 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-11 w-full sm:h-10 sm:w-10 rounded-lg border text-sm font-medium min-h-[44px] ${
              value === n
                ? 'border-[#8B1E3F] bg-[#8B1E3F] text-white'
                : 'border-[#d9d2c5] bg-[#faf8f4] text-[#1a1a1a] active:border-[#8B1E3F]/50'
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
          className={`w-full text-left rounded-xl border px-3.5 sm:px-4 py-3.5 sm:py-3 text-[14px] sm:text-sm leading-snug transition min-h-[48px] ${
            value === o.value
              ? 'border-[#8B1E3F] bg-[#8B1E3F]/8 text-[#1a1a1a] ring-1 ring-[#8B1E3F]/30'
              : 'border-[#d9d2c5] bg-[#faf8f4] active:border-[#8B1E3F]/40'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
