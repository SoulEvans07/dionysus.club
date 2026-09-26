import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { cn } from '~/utils/classnames';
import { focusRing } from './common';

type BackButtonProps = {
  fallback: string; // Where to go when this screen is the first history entry (e.g. opened from a shared link).
  floating?: boolean; // Sits on top of a photo instead of the page background.
  className?: string;
};

export function BackButton(props: BackButtonProps) {
  const { fallback, floating, className } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const goBack = () => {
    if (location.key === 'default') navigate(fallback, { replace: true });
    else navigate(-1);
  };

  return (
    <button
      type="button"
      aria-label="Back"
      onClick={goBack}
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full transition-colors',
        floating
          ? 'bg-slate-900/60 text-white backdrop-blur hover:bg-slate-900/75 active:bg-slate-900/75'
          : 'text-slate-700 hover:bg-slate-300 active:bg-slate-400/50',
        focusRing,
        className
      )}
    >
      <ChevronLeft className="size-6" />
    </button>
  );
}
