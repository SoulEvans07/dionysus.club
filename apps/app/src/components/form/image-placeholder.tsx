import { ImagePlus, type LucideIcon } from 'lucide-react';

import type { ImageDTO } from '@repo/dtos';
import { Photo } from '~/components/catalog/photo';
import { cn } from '~/utils/classnames';

type ImagePlaceholderProps = {
  image?: ImageDTO | null;
  label: string;
  Fallback: LucideIcon;
  fit?: 'cover' | 'contain';
  // Small square for use inside a list row.
  compact?: boolean;
  className?: string;
};

// Stands in for the upload control. An existing photo still shows, but nothing here is wired up yet.
export function ImagePlaceholder(props: ImagePlaceholderProps) {
  const { image, label, Fallback, fit = 'cover', compact, className } = props;

  if (compact) {
    return (
      <button
        type="button"
        disabled
        aria-label={label}
        className={cn(
          'relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 text-slate-400',
          className
        )}
      >
        {image ? (
          <Photo image={image} Fallback={Fallback} className="absolute inset-0" />
        ) : (
          <ImagePlus className="size-5" strokeWidth={1.5} />
        )}
      </button>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-2xl', className)}>
      <Photo image={image} Fallback={Fallback} fit={fit} className="aspect-[4/3] w-full" />
      <button
        type="button"
        disabled
        title="Photo upload isn't available yet"
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500',
          image && 'items-end justify-end border-transparent p-3'
        )}
      >
        <span
          className={cn('flex items-center gap-2 text-sm font-medium', image && 'rounded-full bg-white/90 px-3 py-1.5')}
        >
          <ImagePlus className="size-4" />
          {label}
        </span>
        {!image && <span className="text-sm text-slate-400">Photo upload isn&apos;t available yet</span>}
      </button>
    </div>
  );
}
