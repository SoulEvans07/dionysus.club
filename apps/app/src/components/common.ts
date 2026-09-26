import { tw } from '~/utils/twElem';

export const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2';
export const focusWithinRing =
  'outline-none focus-within:ring-2 focus-within:ring-slate-900 focus-within:ring-offset-2';

export const ScreenFrame = tw.div('hide-scroll absolute inset-0 h-dvh w-dvw overflow-y-auto bg-slate-300');
