import type { LucideIcon } from 'lucide-react';

import type { ImageDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';

type PhotoProps = {
  image: ImageDTO | null | undefined;
  Fallback: LucideIcon;
  alt?: string;
  // Cocktail photos fill their frame; ingredient photos are bottles on white and must not be cropped.
  fit?: 'cover' | 'contain';
  dim?: boolean;
  className?: string;
};

export function Photo(props: PhotoProps) {
  const { image, Fallback, alt = '', fit = 'cover', dim, className } = props;

  return (
    <div className={cn('relative overflow-hidden', fit === 'contain' ? 'bg-white' : 'bg-slate-200', className)}>
      {image ? (
        <img
          src={image.url}
          alt={alt}
          loading="lazy"
          draggable={false}
          className={cn('size-full', fit === 'cover' ? 'object-cover' : 'object-contain', { 'opacity-50': dim })}
        />
      ) : (
        <div className="grid size-full place-items-center text-slate-400">
          <Fallback className="size-1/3 min-h-4 min-w-4" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
