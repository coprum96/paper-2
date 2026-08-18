import type { Pressure, ScenarioFrame } from '../types';
import { COPY } from '../data/copy';
import { URGENCY_SECONDS } from '../data/measures';

function clockNow(): string {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function appInitial(name: string): string {
  const ch = name.trim().charAt(0);
  return ch || '•';
}

export function PushNotice({
  scenario,
  sender,
  banner,
  urgent,
  secondsLeft,
  showFollowUp,
  pressure,
}: {
  scenario: ScenarioFrame;
  sender: string;
  banner: string;
  urgent: boolean;
  secondsLeft: number;
  showFollowUp: boolean;
  pressure: Pressure;
}) {
  const lowTime = urgent && secondsLeft > 0 && secondsLeft <= 10;
  const timerPct = Math.max(0, (secondsLeft / URGENCY_SECONDS) * 100);
  const clock = clockNow();

  return (
    <div className="space-y-3">
      {urgent && (
        <div
          className={`rounded-2xl px-4 py-3 text-white ${
            secondsLeft === 0 ? 'bg-[#7a1c14]' : lowTime ? 'bg-[#b42318] animate-pulse' : 'bg-[#b42318]'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide">{COPY.timerLabel}</p>
            <p className="text-4xl sm:text-5xl font-bold tabular-nums leading-none">{secondsLeft}</p>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/30 overflow-hidden">
            <div className="h-full bg-white transition-[width] duration-1000 linear" style={{ width: `${timerPct}%` }} />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-sm rounded-[2rem] border-[10px] border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
        <div
          className="px-4 pt-3 pb-5 min-h-[420px]"
          style={{
            background: 'linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 40%, #3a2a32 100%)',
          }}
        >
          <div className="flex items-center justify-between text-white/80 text-[11px] px-1">
            <span>{clock}</span>
            <span className="flex gap-1 items-center">
              <span className="opacity-70">LTE</span>
              <span aria-hidden>●●●</span>
            </span>
          </div>
          <p className="text-center text-white text-5xl font-extralight tracking-tight mt-6 mb-1 tabular-nums">{clock}</p>
          <p className="text-center text-white/50 text-xs mb-5">Нажмите, чтобы открыть</p>

          <div className="rounded-2xl bg-white/95 backdrop-blur px-3.5 py-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                  pressure === 'authority' ? 'bg-[#8B1E3F]' : 'bg-zinc-700'
                }`}
              >
                {appInitial(scenario.appName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-zinc-900 truncate">{sender}</p>
                  <p className="text-[11px] text-zinc-500 whitespace-nowrap">сейчас</p>
                </div>
                <p className="text-[15px] font-semibold text-zinc-900 leading-snug mt-0.5">{scenario.title}</p>
                <p className="text-[13px] text-zinc-700 leading-snug mt-1">{scenario.body}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-zinc-100 px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-wide text-zinc-500">Сумма</p>
                <p className="text-sm font-semibold text-zinc-900">{scenario.amount}</p>
              </div>
              <div className="rounded-xl bg-zinc-100 px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-wide text-zinc-500">Срок</p>
                <p className="text-sm font-semibold text-zinc-900">{scenario.deadline}</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500 leading-snug">{scenario.knownLine}</p>
            <p className={`mt-2 text-[12px] font-semibold ${urgent ? 'text-[#b42318]' : 'text-[#8B1E3F]'}`}>{banner}</p>
            <p className="mt-1 text-[13px] font-medium text-zinc-900">{scenario.requestLine}</p>
          </div>

          {showFollowUp && scenario.followUp && (
            <div className="rounded-2xl bg-white/95 backdrop-blur px-3.5 py-3 shadow-lg mt-2 animate-slide-up">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-zinc-900">{scenario.appName}</p>
                <p className="text-[11px] text-zinc-500">сейчас</p>
              </div>
              <p className="text-[13px] text-zinc-700 leading-snug mt-1">{scenario.followUp}</p>
            </div>
          )}
        </div>
      </div>

      {urgent && secondsLeft === 0 && (
        <p className="text-xs text-center text-[#b42318]">{COPY.timerExpired}</p>
      )}
    </div>
  );
}
