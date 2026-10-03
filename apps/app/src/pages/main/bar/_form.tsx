import { useState } from 'react';
import { Globe, Lock, type LucideIcon } from 'lucide-react';

import { CreateBarDTO } from '@repo/dtos';
import { Field } from '~/components/form/field';
import { controlClass, focusWithinRing } from '~/components/common';
import { FormScreen } from '~/components/form/form-screen';
import { Input } from '~/components/shadcn/input';
import { Textarea } from '~/components/textarea';
import { cn } from '~/utils/classnames';
import { fieldErrors, focusFirstError, type FieldErrors } from '~/utils/form';

type BarVisibility = CreateBarDTO['barType'];

type BarFormProps = {
  title: string;
  backTo: string;
  isSaving: boolean;
  error?: string | null;
  onSubmit: (data: CreateBarDTO) => void;
};

export function BarForm(props: BarFormProps) {
  const { title, backTo, isSaving, error, onSubmit } = props;

  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [description, setDescription] = useState('');
  const [barType, setBarType] = useState<BarVisibility>('private');
  const [errors, setErrors] = useState<FieldErrors>({});

  const submit = () => {
    const result = CreateBarDTO.safeParse({ name, slogan, description, barType });
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
      <Field label="Name" htmlFor="name" error={errors.name}>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="The Velvet Room"
          autoComplete="off"
          aria-invalid={!!errors.name}
          className={controlClass}
        />
      </Field>

      <Field label="Slogan" htmlFor="slogan" error={errors.slogan} hint="Optional">
        <Input
          id="slogan"
          value={slogan}
          onChange={(e) => setSlogan(e.target.value)}
          placeholder="Stirred, never shaken"
          autoComplete="off"
          aria-invalid={!!errors.slogan}
          className={controlClass}
        />
      </Field>

      <Field label="Description" htmlFor="description" error={errors.description} hint="Optional">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-invalid={!!errors.description}
          className="rounded-xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        />
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-serif text-2xl tracking-tight">Visibility</legend>
        {visibilityOptions.map((option) => (
          <VisibilityOption
            key={option.value}
            {...option}
            checked={barType === option.value}
            onSelect={() => setBarType(option.value)}
          />
        ))}
      </fieldset>
    </FormScreen>
  );
}

type VisibilityOptionDef = {
  value: BarVisibility;
  label: string;
  description: string;
  Icon: LucideIcon;
};

const visibilityOptions: VisibilityOptionDef[] = [
  {
    value: 'private',
    label: 'Private',
    description: 'Only people you add as members can see this bar.',
    Icon: Lock,
  },
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can find this bar and browse its menu.',
    Icon: Globe,
  },
];

type VisibilityOptionProps = VisibilityOptionDef & {
  checked: boolean;
  onSelect: () => void;
};
function VisibilityOption(props: VisibilityOptionProps) {
  const { value, label, description, Icon, checked, onSelect } = props;

  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-4 rounded-2xl border bg-white px-4 py-3 transition-colors dark:bg-slate-900',
        checked
          ? 'border-slate-900 dark:border-slate-100'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
        focusWithinRing
      )}
    >
      <input type="radio" name="barType" value={value} checked={checked} onChange={onSelect} className="sr-only" />
      <Icon className="size-5 shrink-0" />
      <div className="mr-auto">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <span
        aria-hidden
        className={cn(
          'grid size-5 shrink-0 place-items-center rounded-full border-2',
          checked ? 'border-slate-900 dark:border-slate-100' : 'border-slate-300 dark:border-slate-700'
        )}
      >
        {checked && <span className="size-2.5 rounded-full bg-slate-900 dark:bg-slate-100" />}
      </span>
    </label>
  );
}
