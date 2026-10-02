import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Martini } from 'lucide-react';
import { z } from 'zod';

import { cn } from '~/utils/classnames';
import { focusRing } from '~/components/common';
import { Spinner } from '~/components/shadcn/spinner';
import { RimBackdrop } from '~/components/rim-backdrop';

const SearchParams = z.looseObject({
  redirect: z.string().nullish(),
  error: z.string().nullish(),
});

export function LoginScreen() {
  const [searchParams] = useSearchParams();
  const { redirect, error } = useMemo(() => SearchParams.parse(Object.fromEntries(searchParams)), [searchParams]);

  const [pending, setPending] = useState(false);

  // Coming back from Google via the browser's back button restores this page from bfcache,
  // so the button would otherwise stay stuck in its loading state.
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => e.persisted && setPending(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  const handleGoogle = () => {
    setPending(true);
    const params = new URLSearchParams({ connection: 'google' });
    if (redirect) params.set('redirect', redirect);
    window.location.href = `/api/auth/login?${params}`;
  };

  return (
    <div className="hide-scroll relative flex h-dvh w-dvw flex-col overflow-y-auto bg-slate-200 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-[max(env(safe-area-inset-top),1.5rem)]">
      <RimBackdrop />

      <header className="relative px-6">
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Dionysus Club</span>
      </header>

      <main className="relative mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-10">
        <div className="mb-8 flex size-16 items-center justify-center rounded-full bg-slate-400 text-slate-50 shadow-[0_0_0_6px_var(--color-slate-200),0_0_0_7px_var(--color-slate-300)]">
          <Martini className="size-8" strokeWidth={1.75} />
        </div>
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-slate-900">
          Your bar,
          <br />
          your menu.
        </h1>
        <p className="mt-4 max-w-xs font-serif text-lg leading-relaxed text-slate-600">
          Keep track of what's on the shelf and see what you can mix tonight.
        </p>
      </main>

      <footer className="relative mx-auto flex w-full max-w-sm flex-col gap-3 px-6">
        {error && (
          <p role="alert" className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700">
            Sign-in didn't go through. Give it another try.
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogle}
          disabled={pending}
          aria-busy={pending}
          className={cn(
            'flex h-14 w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white text-base font-medium text-slate-900 shadow-sm transition active:translate-y-px active:bg-slate-50 disabled:cursor-wait disabled:opacity-80',
            focusRing
          )}
        >
          {pending ? <Spinner className="size-5 text-slate-500" /> : <GoogleLogo className="size-5" />}
          {pending ? 'Opening Google…' : 'Continue with Google'}
        </button>

        <p className="text-center text-xs text-slate-500">First time here? Signing in creates your account.</p>
      </footer>
    </div>
  );
}

function GoogleLogo(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...props}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
