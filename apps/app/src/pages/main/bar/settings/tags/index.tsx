import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { z } from 'zod';
import _ from 'lodash';
import { ChevronRight, Plus } from 'lucide-react';

import { hasBarRole, TOP_LEVEL_TAG_NAMESPACE, type TagDTO, type TagType } from '@repo/dtos';
import { EmptyState, ErrorState } from '~/components/catalog/state-message';
import { focusRing } from '~/components/common';
import { useBar } from '~/queries/bar';
import { useTagList } from '~/queries/tag';
import { cn } from '~/utils/classnames';
import { sortTagByFullKey, tagFullKeyUI } from '~/utils/tags';
import { SettingsGroup, SettingsNote, SettingsScreen } from '../_menu';

const Params = z.object({ barId: z.string() });

const typeLabels: Record<TagType, string> = { cocktail: 'Cocktails', ingredient: 'Ingredients', both: 'Both' };

export function BarTagsScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const bar = useBar(barId);
  const tags = useTagList(barId);
  const backTo = `/bar/${barId}/settings`;

  // The list also holds the global defaults from the system bar, which can't be edited here.
  const [own, defaults] = useMemo(
    () => _.partition([...(tags.data ?? [])].sort(sortTagByFullKey), (tag) => tag.barId === barId),
    [tags.data, barId]
  );
  const ownByNamespace = useMemo(() => Object.entries(_.groupBy(own, (tag) => tag.namespace)), [own]);

  if (bar.data && !hasBarRole(bar.data.role, 'bartender')) return <Navigate to={backTo} replace />;

  const canEdit = hasBarRole(bar.data?.role, 'admin');
  const isPending = bar.isPending || tags.isPending;
  const newTag = `/bar/${barId}/settings/tags/new`;

  return (
    <SettingsScreen
      title="Tags"
      subtitle={bar.data?.name}
      backTo={backTo}
      action={
        canEdit && (
          <Link
            to={newTag}
            aria-label="New tag"
            className={cn(
              'grid size-10 place-items-center rounded-full text-slate-700 transition-colors hover:bg-slate-300 active:bg-slate-400/50 dark:text-slate-300 dark:hover:bg-slate-700 dark:active:bg-slate-600/50',
              focusRing
            )}
          >
            <Plus className="size-6" />
          </Link>
        )
      }
    >
      {(bar.isError || tags.isError) && (
        <ErrorState what="tags" onRetry={() => Promise.all([bar.refetch(), tags.refetch()])} />
      )}
      {isPending && <div aria-hidden className="skeleton h-48 w-full rounded-2xl" />}
      {!isPending && !tags.isError && (
        <>
          {!canEdit && <SettingsNote>Only the owner and admins can add or edit tags.</SettingsNote>}
          {own.length === 0 && (
            <EmptyState title="No tags yet">
              Tags this bar adds will show up here, next to the defaults every bar gets.
            </EmptyState>
          )}
          {ownByNamespace.map(([namespace, group]) => (
            <SettingsGroup key={namespace} title={namespace === TOP_LEVEL_TAG_NAMESPACE ? 'Top level' : namespace}>
              {group.map((tag) => (
                <TagRow key={tag.id} tag={tag} to={canEdit ? `/bar/${barId}/settings/tags/${tag.id}` : undefined} />
              ))}
            </SettingsGroup>
          ))}
          {defaults.length > 0 && (
            <SettingsGroup title="Defaults">
              {defaults.map((tag) => (
                <TagRow key={tag.id} tag={tag} />
              ))}
            </SettingsGroup>
          )}
        </>
      )}
    </SettingsScreen>
  );
}

type TagRowProps = { tag: TagDTO; to?: string };
function TagRow(props: TagRowProps) {
  const { tag, to } = props;

  const content = (
    <>
      <span className="size-3 shrink-0 rounded-full border border-white/20" style={{ backgroundColor: tag.color }} />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{tag.name}</span>
        <span className="truncate text-sm text-slate-500 dark:text-slate-400">{tagFullKeyUI(tag)}</span>
      </div>
      <span className="ml-auto shrink-0 text-sm text-slate-500 dark:text-slate-400">{typeLabels[tag.type]}</span>
      {to && <ChevronRight className="size-4 shrink-0 text-slate-400 dark:text-slate-500" />}
    </>
  );

  if (!to) return <div className="flex min-h-12 items-center gap-3 px-4 py-3">{content}</div>;

  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-12 items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/60 dark:active:bg-slate-800',
        focusRing
      )}
    >
      {content}
    </Link>
  );
}
