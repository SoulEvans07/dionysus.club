import type { FormEvent, ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';

import { BackButton } from '~/components/catalog/back-button';
import { ScreenFrame } from '~/components/catalog/common';
import { ErrorState } from '~/components/catalog/state';
import { Button } from '~/components/shadcn/buttin';
import { Spinner } from '~/components/shadcn/spinner';

type FormScreenProps = {
  title: string;
  backTo: string;
  isSaving: boolean;
  error?: string | null;
  onSubmit: () => void;
  children: ReactNode;
};

// Full-screen shell for create/edit forms: sticky header with the save action, fields below.
export function FormScreen(props: FormScreenProps) {
  const { title, backTo, isSaving, error, onSubmit, children } = props;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isSaving) onSubmit();
  };

  return (
    <ScreenFrame className="z-300">
      <form noValidate onSubmit={handleSubmit}>
        <header className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <BackButton fallback={backTo} />
            <h1 className="font-serif text-2xl tracking-tight">{title}</h1>
            <Button
              type="submit"
              disabled={isSaving}
              className="ml-auto h-10 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
            >
              {isSaving && <Spinner className="size-4" />}
              {isSaving ? 'Saving' : 'Save'}
            </Button>
          </div>
        </header>

        <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 pb-24 pt-4">
          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-2xl border border-slate-900 bg-white px-4 py-3">
              <CircleAlert className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-medium">Couldn&apos;t save</p>
                <p className="text-sm text-slate-600">{error}</p>
              </div>
            </div>
          )}
          {children}
        </main>
      </form>
    </ScreenFrame>
  );
}

type FormLoadingProps = { title: string; backTo: string; what: string; error: boolean; onRetry: () => void };

// Stands in for a form while the thing being edited loads (or fails to).
export function FormLoading(props: FormLoadingProps) {
  const { title, backTo, what, error, onRetry } = props;

  return (
    <ScreenFrame className="z-300">
      <header className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
        <BackButton fallback={backTo} />
        <h1 className="font-serif text-2xl tracking-tight">{title}</h1>
      </header>
      {error ? (
        <ErrorState what={what} onRetry={onRetry} />
      ) : (
        <div aria-hidden className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-4">
          <div className="skeleton aspect-[4/3] w-full rounded-2xl" />
          <div className="skeleton h-11 w-full rounded-xl" />
          <div className="skeleton h-24 w-full rounded-xl" />
        </div>
      )}
    </ScreenFrame>
  );
}
