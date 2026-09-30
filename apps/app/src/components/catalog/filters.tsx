import { Search, X } from 'lucide-react';

import { Input } from '~/components/shadcn/input';

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
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="text"
        name="search"
        aria-label={label}
        role="searchbox"
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border-slate-200 bg-white px-9 shadow-none"
      />
      {onClear && value.length > 0 && (
        <X className="absolute right-0 top-1/2 size-10 -translate-y-1/2 p-2.5 text-slate-400" onClick={onClear} />
      )}
    </div>
  );
}
