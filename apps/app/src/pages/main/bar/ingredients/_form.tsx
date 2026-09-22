import { useState } from 'react';
import { Wine } from 'lucide-react';

import { CreateIngredientDTO, type IngredientDTO } from '@repo/dtos';
import { Field, controlClass } from '~/components/form/field';
import { FormScreen } from '~/components/form/form-screen';
import { ImagePlaceholder } from '~/components/form/image-placeholder';
import { TagPicker } from '~/components/form/tag-picker';
import { Input } from '~/components/shadcn/input';
import { Switch } from '~/components/shadcn/switch';
import { Textarea } from '~/components/shadcn/textarea';
import { useIngredientTagList } from '~/queries/tag';
import { fieldErrors, focusFirstError, type FieldErrors } from '~/utils/form';

type IngredientFormProps = {
  barId: string;
  title: string;
  backTo: string;
  // Present when editing.
  initial?: IngredientDTO;
  isSaving: boolean;
  error?: string | null;
  onSubmit: (data: CreateIngredientDTO) => void;
};

export function IngredientForm(props: IngredientFormProps) {
  const { barId, title, backTo, initial, isSaving, error, onSubmit } = props;

  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [available, setAvailable] = useState(initial?.available ?? false);
  const [tagIds, setTagIds] = useState(() => initial?.tags.map((t) => t.id) ?? []);
  const [errors, setErrors] = useState<FieldErrors>({});

  const tags = useIngredientTagList(barId);

  const submit = () => {
    const result = CreateIngredientDTO.safeParse({ name, description, available, tagIds });
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
      <ImagePlaceholder image={initial?.cardImage} label="Add photo" Fallback={Wine} fit="contain" />

      <Field label="Name" htmlFor="name" error={errors.name}>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Campari"
          autoComplete="off"
          aria-invalid={!!errors.name}
          className={controlClass}
        />
      </Field>

      <Field label="Description" htmlFor="description" error={errors.description} hint="Optional">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-invalid={!!errors.description}
          className="rounded-xl border-slate-200 bg-white"
        />
      </Field>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <div>
          <label htmlFor="available" className="font-medium">
            In stock
          </label>
          <p className="text-sm text-slate-500">Turn this off when the bottle runs out.</p>
        </div>
        <Switch id="available" checked={available} onCheckedChange={setAvailable} />
      </div>

      <section aria-labelledby="tags-heading" className="flex flex-col gap-3">
        <h2 id="tags-heading" className="font-serif text-2xl tracking-tight">
          Tags
        </h2>
        <TagPicker tags={tags.data ?? []} value={tagIds} onChange={setTagIds} isPending={tags.isPending} />
      </section>
    </FormScreen>
  );
}
