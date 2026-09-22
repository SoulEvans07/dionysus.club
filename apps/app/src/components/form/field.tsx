import type { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';

// Shared look for text controls: white on the slate page, with a dark border (not red) for errors.
export const controlClass =
  'h-11 rounded-xl border-slate-200 bg-white shadow-none aria-invalid:border-slate-900 aria-invalid:ring-slate-900/15';

type FieldProps = { label: string; htmlFor: string; error?: string; hint?: string; children: ReactNode };

export function Field(props: FieldProps) {
  const { label, htmlFor, error, hint, children } = props;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? <FieldError>{error}</FieldError> : hint && <p className="text-sm text-slate-500">{hint}</p>}
    </div>
  );
}

export function FieldError(props: { children: ReactNode }) {
  return (
    <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
      <CircleAlert className="size-4 shrink-0" />
      {props.children}
    </p>
  );
}
