import { tw } from '~/utils/twElem';

export const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2';

// Full-screen overlay that hosts one catalog screen (list or detail).
export const ScreenFrame = tw.div('absolute inset-0 h-dvh w-dvw overflow-y-auto bg-slate-100 text-slate-900');
