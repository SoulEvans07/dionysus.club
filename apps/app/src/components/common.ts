import { tw } from '~/utils/twElem';

export const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-100 dark:focus-visible:ring-offset-slate-950';
export const focusWithinRing =
  'outline-none focus-within:ring-2 focus-within:ring-slate-900 focus-within:ring-offset-2 dark:focus-within:ring-slate-100 dark:focus-within:ring-offset-slate-950';

// Shared look for text controls: white on the slate page, with a dark border (not red) for errors.
export const controlClass =
  'h-11 rounded-md border-slate-200 bg-white shadow-none aria-invalid:border-slate-900 aria-invalid:ring-slate-900/15 dark:border-slate-800 dark:bg-slate-900 dark:aria-invalid:border-slate-100 dark:aria-invalid:ring-slate-100/15';

export const ScreenFrame = tw.div('hide-scroll absolute inset-0 h-dvh w-dvw overflow-y-auto');
