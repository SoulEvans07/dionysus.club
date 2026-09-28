import { useMemo } from 'react';
import { Navigate } from 'react-router';

import { cn } from '~/utils/classnames';
import { useTagList } from '~/queries/tag';
import { tagFullKey } from '~/utils/tags';

type TagSubtitleProps = { barId: string; tagKey: string };
export function TagSubtitle(props: TagSubtitleProps) {
  const { barId, tagKey } = props;

  const list = useTagList(barId);
  const tag = useMemo(() => list.data?.find((t) => tagFullKey(t) === tagKey), [list.data, tagKey]);
  if (list.isSuccess && tag === undefined) return <Navigate to={`/bar/${barId}`} replace />;

  return <h2 className={cn('-mt-1! rounded-md text-xs', { skeleton: list.isPending })}>{tag?.name ?? 'Loading'}</h2>;
}
