import type { LucideIcon } from 'lucide-react';

import type { ImageDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';

type PhotoProps = {
  image?: ImageDTO | null;
  fallback: LucideIcon;
  alt?: string;
  // Cocktail photos fill their frame; ingredient photos are bottles on white and must not be cropped.
  fit?: 'cover' | 'contain';
  dim?: boolean;
  className?: string;
};

export function Photo(props: PhotoProps) {
  const { image, fallback: Fallback, alt = '', fit = 'cover', dim, className } = props;

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        fit === 'contain' ? 'bg-white' : 'bg-slate-200 dark:bg-slate-800',
        className
      )}
    >
      {image ? (
        <img
          src={image.url}
          alt={alt}
          loading="lazy"
          draggable={false}
          className={cn('size-full', fit === 'cover' ? 'object-cover' : 'object-contain', { 'opacity-50': dim })}
        />
      ) : (
        <div className="grid size-full place-items-center text-slate-400 dark:text-slate-600">
          <Fallback className="size-1/2 min-h-4 min-w-4" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
