import { ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { cn } from '~/utils/classnames';
import { focusRing } from './common';

type BackButtonProps = {
  // Where to go when this screen is the first history entry (e.g. opened from a shared link).
  fallback: string;
  // Sits on top of a photo instead of the page background.
  floating?: boolean;
  className?: string;
};

export function BackButton(props: BackButtonProps) {
  const { fallback, floating, className } = props;
  const navigate = useNavigate();
  const location = useLocation();

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
          ? 'bg-slate-900/60 text-white backdrop-blur hover:bg-slate-900/75'
          : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
        focusRing,
        className
      )}
    >
      <ChevronLeft className="size-5" />
    </button>
  );
}
