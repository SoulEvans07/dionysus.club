// Soft concentric rings behind the content, like the rim of a glass seen from above.
export function RimBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-40 -top-40 size-[28rem] rounded-full border border-slate-300/70 dark:border-slate-700/70" />
      <div className="absolute -right-28 -top-28 size-[21rem] rounded-full border border-slate-300/60 dark:border-slate-700/60" />
      <div className="absolute -right-16 -top-16 size-56 rounded-full bg-slate-500/40 blur-2xl dark:bg-slate-600/30" />
    </div>
  );
}
