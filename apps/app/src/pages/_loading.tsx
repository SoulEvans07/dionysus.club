import { RimBackdrop } from '~/components/rim-backdrop';

export function LoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex h-dvh w-dvw flex-col items-center justify-center overflow-hidden bg-slate-200 px-6"
    >
      <RimBackdrop />

      {/* Fades in after a short delay so quick loads don't flash the splash. */}
      <div className="animate-in fade-in fill-mode-both relative flex flex-col items-center delay-200 duration-500">
        <PouringGlass className="size-28 text-slate-500" />
        <p className="mt-6 font-serif text-3xl tracking-tight text-slate-900">Dionysus Club</p>
        <p className="mt-2 font-serif text-base text-slate-600">Setting up your bar…</p>
      </div>
    </div>
  );
}

// One period of the liquid's surface is 16 units wide; the path spans enough periods
// that sliding it left by one period loops seamlessly inside the glass.
const WAVE_PATH =
  'M-64 0 Q-60 -1.5 -56 0' + Array.from({ length: 23 }, (_, i) => ` T${-48 + i * 8} 0`).join('') + ' V40 H-64 Z';

function PouringGlass(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden {...props}>
      <defs>
        <clipPath id="splash-bowl">
          <path d="M9.5 12.75 H54.5 L32 37.5 Z" />
        </clipPath>
      </defs>

      <g clipPath="url(#splash-bowl)">
        <g className="splash-pour">
          <path d={WAVE_PATH} className="splash-wave fill-slate-400" />
        </g>
      </g>

      <g stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12 H56 L32 38 Z" />
        <path d="M32 38 V54" />
        <path d="M22 54 H42" />
      </g>
    </svg>
  );
}
