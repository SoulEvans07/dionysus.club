import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';

import { CreateTagDTO, TOP_LEVEL_TAG_NAMESPACE, type TagDTO, type TagType } from '@repo/dtos';
import { controlClass, focusRing } from '~/components/common';
import { Field } from '~/components/form/field';
import { FormScreen } from '~/components/form/form-screen';
import { NativeSelect } from '~/components/native-select';
import { Input } from '~/components/shadcn/input';
import { cn } from '~/utils/classnames';
import { fieldErrors, focusFirstError, type FieldErrors } from '~/utils/form';
import { tagFullKeyUI } from '~/utils/tags';
import { ConfirmAction, SettingsGroup } from '../_menu';

// Light enough to read as a dot on both themes; the seeded defaults use the same range.
const SWATCHES = [
  '#F87171',
  '#FB923C',
  '#FBBF24',
  '#FDE047',
  '#A3E635',
  '#86EFAC',
  '#2DD4BF',
  '#38BDF8',
  '#818CF8',
  '#C084FC',
  '#F472B6',
  '#B45309',
  '#E2E8F0',
];

const typeOptions: { value: TagType; label: string }[] = [
  { value: 'both', label: 'Cocktails and ingredients' },
  { value: 'cocktail', label: 'Cocktails only' },
  { value: 'ingredient', label: 'Ingredients only' },
];

// "Dry Vermouth" -> "dry-vermouth"
function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type TagFormProps = {
  title: string;
  backTo: string;
  initial?: TagDTO; // Present when editing.
  isSaving: boolean;
  error?: string | null;
  onSubmit: (data: CreateTagDTO) => void;
  onDelete?: { isPending: boolean; error?: string | null; run: () => void };
};

export function TagForm(props: TagFormProps) {
  const { title, backTo, initial, isSaving, error, onSubmit, onDelete } = props;

  const [name, setName] = useState(initial?.name ?? '');
  const [namespace, setNamespace] = useState(
    initial && initial.namespace !== TOP_LEVEL_TAG_NAMESPACE ? initial.namespace : ''
  );
  // A new tag's key follows its name until the key is edited by hand.
  const [key, setKey] = useState(initial?.key ?? '');
  const [keyTouched, setKeyTouched] = useState(!!initial);
  const [type, setType] = useState<TagType>(initial?.type ?? 'both');
  const [color, setColor] = useState(initial?.color ?? SWATCHES[0]);
  const [errors, setErrors] = useState<FieldErrors>({});

  const resolvedNamespace = namespace.trim() || TOP_LEVEL_TAG_NAMESPACE;
  const resolvedKey = keyTouched ? key : slugify(name);

  const submit = () => {
    const result = CreateTagDTO.safeParse({ name, namespace: resolvedNamespace, key: resolvedKey, type, color });
    if (!result.success) {
      const found = fieldErrors(result.error);
      setErrors(found);
      focusFirstError(found);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  return (
    <FormScreen title={title} backTo={backTo} isSaving={isSaving} error={error} onSubmit={submit}>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <span className="size-3 shrink-0 rounded-full border border-white/20" style={{ backgroundColor: color }} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{name.trim() || 'New tag'}</span>
          <span className="truncate text-sm text-slate-500 dark:text-slate-400">
            {tagFullKeyUI({ namespace: resolvedNamespace, key: resolvedKey || 'key' })}
          </span>
        </div>
      </div>

      <Field label="Name" htmlFor="name" error={errors.name}>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dry vermouth"
          autoComplete="off"
          aria-invalid={!!errors.name}
          className={controlClass}
        />
      </Field>

      <Field
        label="Group"
        htmlFor="namespace"
        error={errors.namespace}
        hint="Groups related tags, e.g. spirit. Leave empty for a top-level tag."
      >
        <Input
          id="namespace"
          value={namespace}
          onChange={(e) => setNamespace(e.target.value.toLowerCase())}
          placeholder="spirit"
          autoComplete="off"
          autoCapitalize="none"
          aria-invalid={!!errors.namespace}
          className={controlClass}
        />
      </Field>

      <Field label="Key" htmlFor="key" error={errors.key} hint="Used to filter by this tag.">
        <Input
          id="key"
          value={resolvedKey}
          onChange={(e) => {
            setKeyTouched(true);
            setKey(e.target.value.toLowerCase());
          }}
          placeholder="dry-vermouth"
          autoComplete="off"
          autoCapitalize="none"
          aria-invalid={!!errors.key}
          className={controlClass}
        />
      </Field>

      <Field label="Used for" htmlFor="type" error={errors.type}>
        <NativeSelect
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as TagType)}
          className={controlClass}
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      </Field>

      <Field label="Color" htmlFor="color" error={errors.color}>
        <div role="radiogroup" aria-label="Color" className="flex flex-wrap gap-2">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              role="radio"
              aria-checked={color.toUpperCase() === swatch}
              aria-label={swatch}
              onClick={() => setColor(swatch)}
              className={cn(
                'grid size-10 place-items-center rounded-full border border-slate-300 dark:border-slate-700',
                focusRing
              )}
              style={{ backgroundColor: swatch }}
            >
              {color.toUpperCase() === swatch && <Check className="size-5 text-slate-900" />}
            </button>
          ))}
          <label
            className={cn(
              'relative grid size-10 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700',
              !SWATCHES.includes(color.toUpperCase()) && 'border-solid border-slate-900 dark:border-slate-100'
            )}
            style={SWATCHES.includes(color.toUpperCase()) ? undefined : { backgroundColor: color }}
            title="Custom color"
          >
            <span className="sr-only">Custom color</span>
            <input
              id="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value.toUpperCase())}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            {SWATCHES.includes(color.toUpperCase()) && <span className="text-lg leading-none">+</span>}
          </label>
        </div>
      </Field>

      {initial && onDelete && (
        <SettingsGroup title="Danger zone">
          <ConfirmAction
            icon={Trash2}
            label="Delete tag"
            description={`"${initial.name}" will be removed from every cocktail and ingredient in this bar.`}
            confirmLabel="Delete"
            isPending={onDelete.isPending}
            error={onDelete.error}
            onConfirm={onDelete.run}
          />
        </SettingsGroup>
      )}
    </FormScreen>
  );
}
