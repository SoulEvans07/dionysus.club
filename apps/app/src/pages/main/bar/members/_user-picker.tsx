import { useState } from 'react';
import { CircleUser } from 'lucide-react';
import { useDebounce } from '@uidotdev/usehooks';

import type { PublicUserDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { USER_SEARCH_MIN_LENGTH, useUserSearch } from '~/queries/user';
import { focusRing } from '~/components/common';
import { Photo } from '~/components/catalog/photo';
import { SearchField } from '~/components/catalog/filters';
import { Button } from '~/components/shadcn/button';
import { Spinner } from '~/components/shadcn/spinner';

type UserPickerProps = {
  id: string;
  value: PublicUserDTO | null;
  onChange: (user: PublicUserDTO | null) => void;
  memberIds: Set<string>; // Already in the bar, so shown but not pickable.
  invalid?: boolean;
};
export function UserPicker(props: UserPickerProps) {
  const { id, value, onChange, memberIds, invalid } = props;
  const [text, setText] = useState('');
  const needle = useDebounce(text, 250);
  const search = useUserSearch(needle);

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <Avatar user={value} />
        <span className="mr-auto truncate font-medium">{value.username}</span>
        <Button variant="ghost" className="h-9 rounded-xl px-3" onClick={() => onChange(null)}>
          Change
        </Button>
      </div>
    );
  }

  const tooShort = text.trim().length < USER_SEARCH_MIN_LENGTH;
  const results = search.data ?? [];

  return (
    // Enter in the search box shouldn't submit the surrounding form.
    <div className="flex flex-col gap-2" onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
      <div className="flex items-center gap-2">
        <SearchField
          id={id}
          label="Search by username"
          value={text}
          onChange={setText}
          onClear={() => setText('')}
          invalid={invalid}
        />
        {search.isFetching && <Spinner className="size-4 shrink-0 text-slate-400" />}
      </div>

      {tooShort ? (
        <Hint>Type at least {USER_SEARCH_MIN_LENGTH} characters of their username.</Hint>
      ) : search.isError ? (
        <Hint>Couldn&apos;t search right now. Try again in a moment.</Hint>
      ) : search.isSuccess && results.length === 0 ? (
        <Hint>No one matches &ldquo;{needle.trim()}&rdquo;.</Hint>
      ) : (
        results.length > 0 && (
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {results.map((user) => {
              const isMember = memberIds.has(user.id);
              return (
                <li key={user.id}>
                  <button
                    type="button"
                    disabled={isMember}
                    onClick={() => onChange(user)}
                    className={cn(
                      'flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-slate-100 active:bg-slate-200/60 disabled:pointer-events-none dark:hover:bg-slate-800 dark:active:bg-slate-800/60',
                      focusRing,
                      'focus-visible:ring-inset focus-visible:ring-offset-0'
                    )}
                  >
                    <Avatar user={user} dim={isMember} />
                    <span className={cn('mr-auto truncate font-medium', { 'text-slate-400': isMember })}>
                      {user.username}
                    </span>
                    {isMember && <span className="shrink-0 text-sm text-slate-400">Already a member</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
}

function Avatar(props: { user: PublicUserDTO; dim?: boolean }) {
  const { user, dim } = props;
  return <Photo image={user.profileImage} fallback={CircleUser} dim={dim} className="size-10 shrink-0 rounded-full" />;
}

function Hint(props: React.PropsWithChildren) {
  return <p className="px-1 text-sm text-slate-500 dark:text-slate-400">{props.children}</p>;
}
