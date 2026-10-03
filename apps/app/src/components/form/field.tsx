import { CircleAlert } from 'lucide-react';

type FieldProps = React.PropsWithChildren<{
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}>;
export function Field(props: FieldProps) {
  const { label, htmlFor, error, hint, children } = props;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        hint && <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
}

export function FieldError(props: React.PropsWithChildren) {
  return (
    <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-slate-100">
      <CircleAlert className="size-4 shrink-0" />
      {props.children}
    </p>
  );
}
