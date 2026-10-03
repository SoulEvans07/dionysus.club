import { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useMediaQuery } from '@uidotdev/usehooks';

import { Input } from '~/components/shadcn/input';
import {
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '~/components/shadcn/drawer';
import { Sheet, SheetHeader, SheetTitle, SheetClose, SheetContent, SheetTrigger } from '~/components/shadcn/sheet';

type SearchFieldProps = {
  value: string;
  label: string;
  onChange: (value: string) => void;
  onClear?: VoidFunction;
};
export function SearchField(props: SearchFieldProps) {
  const { value, label, onChange, onClear } = props;

  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
      <Input
        type="text"
        name="search"
        aria-label={label}
        role="searchbox"
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border-slate-200 bg-white px-9 shadow-none dark:border-slate-800 dark:bg-slate-900"
      />
      {onClear && value.length > 0 && (
        <X
          className="absolute right-0 top-1/2 size-10 -translate-y-1/2 p-2.5 text-slate-400 dark:text-slate-500"
          onClick={onClear}
        />
      )}
    </div>
  );
}

type FilterContainerProps = {
  children: [React.ReactNode, React.ReactNode];
};
export function FilterContainer(props: FilterContainerProps) {
  const {
    children: [trigger, content],
  } = props;
  const isMobile = useMediaQuery('(max-width: 640px)');

  const { Root, Trigger, Content } = useMemo(() => {
    if (isMobile) return { Root: Drawer, Trigger: DrawerTrigger, Content: DrawerContent };
    return { Root: Sheet, Trigger: SheetTrigger, Content: SheetContent };
  }, [isMobile]);

  return (
    <Root>
      <Trigger>{trigger}</Trigger>
      <Content className="border-none bg-slate-200 dark:bg-slate-900">{content}</Content>
    </Root>
  );
}
