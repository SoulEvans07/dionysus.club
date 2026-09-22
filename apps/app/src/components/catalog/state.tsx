import type { ReactNode } from 'react';

import { Button } from '~/components/shadcn/buttin';

type StateMessageProps = { title: string; children?: ReactNode; action?: { label: string; onClick: () => void } };

function StateMessage(props: StateMessageProps) {
  const { title, children, action } = props;

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-1 px-4 py-16 text-center">
      <h2 className="font-serif text-xl">{title}</h2>
      {children && <p className="text-sm text-slate-500">{children}</p>}
      {action && (
        <Button variant="outline" className="mt-3 border-slate-300 bg-white" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export const EmptyState = StateMessage;

type ErrorStateProps = { what: string; onRetry: () => void };

export function ErrorState(props: ErrorStateProps) {
  const { what, onRetry } = props;

  return (
    <StateMessage title={`Couldn't load ${what}`} action={{ label: 'Try again', onClick: onRetry }}>
      Check your connection and try again.
    </StateMessage>
  );
}
