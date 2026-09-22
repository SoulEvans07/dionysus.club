import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Martini, Plus, Trash2 } from 'lucide-react';

import { CreateCocktailDTO, type CocktailDTO, type IngredientDTO } from '@repo/dtos';
import { focusRing } from '~/components/catalog/common';
import { Field, FieldError, controlClass } from '~/components/form/field';
import { FormScreen } from '~/components/form/form-screen';
import { IconButton } from '~/components/form/icon-button';
import { ImagePlaceholder } from '~/components/form/image-placeholder';
import { TagPicker } from '~/components/form/tag-picker';
import { Button } from '~/components/shadcn/buttin';
import { Input } from '~/components/shadcn/input';
import { NativeSelect } from '~/components/shadcn/native-select';
import { Textarea } from '~/components/shadcn/textarea';
import { useIngredientList } from '~/queries/ingredient';
import { useCocktailTagList } from '~/queries/tag';
import { cn } from '~/utils/classnames';
import { fieldErrors, focusFirstError, moveItem, newRowKey, type FieldErrors } from '~/utils/form';

type RecipeRow = {
  key: string;
  ingredientId: string;
  // Kept as text while typing; parsed on save.
  quantity: string;
  unit: string;
  isOptional: boolean;
  isGarnish: boolean;
};

type StepRow = { key: string; description: string; image: CocktailDTO['steps'][number]['image'] };

const commonUnits = ['ml', 'cl', 'oz', 'dash', 'drop', 'tsp', 'barspoon', 'pcs', 'slice'];

const emptyRecipeRow = (): RecipeRow => ({
  key: newRowKey(),
  ingredientId: '',
  quantity: '',
  unit: 'ml',
  isOptional: false,
  isGarnish: false,
});

type CocktailFormProps = {
  barId: string;
  title: string;
  backTo: string;
  // Present when editing.
  initial?: CocktailDTO;
  isSaving: boolean;
  error?: string | null;
  onSubmit: (data: CreateCocktailDTO) => void;
};

export function CocktailForm(props: CocktailFormProps) {
  const { barId, title, backTo, initial, isSaving, error, onSubmit } = props;

  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [tagIds, setTagIds] = useState(() => initial?.tags.map((t) => t.id) ?? []);
  const [recipe, setRecipe] = useState<RecipeRow[]>(() =>
    initial
      ? initial.recipe.map((item) => ({
          key: newRowKey(),
          ingredientId: item.ingredient.id,
          quantity: String(item.quantity),
          unit: item.unit,
          isOptional: item.isOptional,
          isGarnish: item.isGarnish,
        }))
      : [emptyRecipeRow()]
  );
  const [steps, setSteps] = useState<StepRow[]>(() =>
    (initial?.steps ?? []).map((step) => ({ key: newRowKey(), description: step.description, image: step.image }))
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const tags = useCocktailTagList(barId);
  const ingredients = useIngredientList(barId);
  const sortedIngredients = useMemo(
    () => [...(ingredients.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [ingredients.data]
  );

  const updateRecipe = (key: string, patch: Partial<RecipeRow>) =>
    setRecipe((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const updateStep = (key: string, patch: Partial<StepRow>) =>
    setSteps((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const submit = () => {
    const result = CreateCocktailDTO.safeParse({
      name,
      description,
      tagIds,
      recipe: recipe.map((row) => ({
        ingredientId: row.ingredientId,
        quantity: Number(row.quantity.replace(',', '.')),
        unit: row.unit,
        isOptional: row.isOptional,
        isGarnish: row.isGarnish,
      })),
      steps: steps.map((step) => ({ description: step.description, imageId: step.image?.id ?? null })),
    });

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
      <ImagePlaceholder image={initial?.cardImage} label="Add photo" Fallback={Martini} />

      <Field label="Name" htmlFor="name" error={errors.name}>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Negroni"
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

      <section aria-labelledby="tags-heading" className="flex flex-col gap-3">
        <h2 id="tags-heading" className="font-serif text-2xl tracking-tight">
          Tags
        </h2>
        <TagPicker tags={tags.data ?? []} value={tagIds} onChange={setTagIds} isPending={tags.isPending} />
      </section>

      <section aria-labelledby="recipe-heading" className="flex flex-col gap-3">
        <h2 id="recipe-heading" className="font-serif text-2xl tracking-tight">
          Recipe
        </h2>
        {errors.recipe && <FieldError>{errors.recipe}</FieldError>}

        <ul className="flex flex-col gap-3">
          {recipe.map((row, i) => (
            <li key={row.key}>
              <RecipeRowEditor
                index={i}
                row={row}
                count={recipe.length}
                ingredients={sortedIngredients}
                isLoadingIngredients={ingredients.isPending}
                takenIds={recipe.filter((r) => r.key !== row.key).map((r) => r.ingredientId)}
                errors={errors}
                onChange={(patch) => updateRecipe(row.key, patch)}
                onMove={(to) => setRecipe((rows) => moveItem(rows, i, to))}
                onRemove={() => setRecipe((rows) => rows.filter((r) => r.key !== row.key))}
              />
            </li>
          ))}
        </ul>
        <datalist id="recipe-units">
          {commonUnits.map((unit) => (
            <option key={unit} value={unit} />
          ))}
        </datalist>

        <Button
          id="recipe"
          type="button"
          variant="outline"
          className="h-10 self-start rounded-xl border-slate-300 bg-white px-4"
          onClick={() => setRecipe((rows) => [...rows, emptyRecipeRow()])}
        >
          <Plus />
          Add ingredient
        </Button>
      </section>

      <section aria-labelledby="method-heading" className="flex flex-col gap-3">
        <h2 id="method-heading" className="font-serif text-2xl tracking-tight">
          Method
        </h2>
        {steps.length > 0 && (
          <ol className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <li key={step.key} className="flex gap-3">
                <span
                  aria-hidden
                  className="w-6 shrink-0 pt-2 text-right font-serif text-2xl leading-none text-slate-400"
                >
                  {i + 1}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Textarea
                    id={`steps.${i}.description`}
                    aria-label={`Step ${i + 1}`}
                    value={step.description}
                    onChange={(e) => updateStep(step.key, { description: e.target.value })}
                    aria-invalid={!!errors[`steps.${i}.description`]}
                    placeholder="Stir with ice for 30 seconds"
                    className="aria-invalid:border-slate-900 min-h-20 rounded-xl border-slate-200 bg-white"
                  />
                  {errors[`steps.${i}.description`] && <FieldError>{errors[`steps.${i}.description`]}</FieldError>}
                  <div className="flex items-center gap-1">
                    <ImagePlaceholder
                      compact
                      image={step.image}
                      label={`Add photo to step ${i + 1}`}
                      Fallback={Martini}
                    />
                    <div className="ml-auto flex">
                      <IconButton
                        label={`Move step ${i + 1} up`}
                        disabled={i === 0}
                        onClick={() => setSteps((rows) => moveItem(rows, i, i - 1))}
                      >
                        <ArrowUp className="size-4" />
                      </IconButton>
                      <IconButton
                        label={`Move step ${i + 1} down`}
                        disabled={i === steps.length - 1}
                        onClick={() => setSteps((rows) => moveItem(rows, i, i + 1))}
                      >
                        <ArrowDown className="size-4" />
                      </IconButton>
                      <IconButton
                        label={`Remove step ${i + 1}`}
                        onClick={() => setSteps((rows) => rows.filter((r) => r.key !== step.key))}
                      >
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
        <Button
          type="button"
          variant="outline"
          className="h-10 self-start rounded-xl border-slate-300 bg-white px-4"
          onClick={() => setSteps((rows) => [...rows, { key: newRowKey(), description: '', image: null }])}
        >
          <Plus />
          Add step
        </Button>
      </section>
    </FormScreen>
  );
}

type RecipeRowEditorProps = {
  index: number;
  row: RecipeRow;
  count: number;
  ingredients: IngredientDTO[];
  isLoadingIngredients: boolean;
  // Ingredients already used by other rows - a recipe can only list each one once.
  takenIds: string[];
  errors: FieldErrors;
  onChange: (patch: Partial<RecipeRow>) => void;
  onMove: (to: number) => void;
  onRemove: () => void;
};

function RecipeRowEditor(props: RecipeRowEditorProps) {
  const { index, row, count, ingredients, isLoadingIngredients, takenIds, errors, onChange, onMove, onRemove } = props;

  const ingredientKey = `recipe.${index}.ingredientId`;
  const quantityKey = `recipe.${index}.quantity`;
  const unitKey = `recipe.${index}.unit`;
  const rowError = errors[ingredientKey] ?? errors[quantityKey] ?? errors[unitKey];
  const label = `ingredient ${index + 1}`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-1">
        <NativeSelect
          id={ingredientKey}
          aria-label={`Ingredient ${index + 1}`}
          value={row.ingredientId}
          disabled={isLoadingIngredients}
          aria-invalid={!!errors[ingredientKey]}
          onChange={(e) => onChange({ ingredientId: e.target.value })}
          className={controlClass}
        >
          <option value="">{isLoadingIngredients ? 'Loading ingredients' : 'Choose an ingredient'}</option>
          {ingredients.map((ingredient) => (
            <option key={ingredient.id} value={ingredient.id} disabled={takenIds.includes(ingredient.id)}>
              {ingredient.name}
            </option>
          ))}
        </NativeSelect>
        <IconButton label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(index - 1)}>
          <ArrowUp className="size-4" />
        </IconButton>
        <IconButton label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(index + 1)}>
          <ArrowDown className="size-4" />
        </IconButton>
        <IconButton label={`Remove ${label}`} onClick={onRemove}>
          <Trash2 className="size-4" />
        </IconButton>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          id={quantityKey}
          aria-label={`Amount for ingredient ${index + 1}`}
          inputMode="decimal"
          placeholder="Amount"
          value={row.quantity}
          aria-invalid={!!errors[quantityKey]}
          onChange={(e) => onChange({ quantity: e.target.value })}
          className={cn(controlClass, 'w-24')}
        />
        <Input
          id={unitKey}
          aria-label={`Unit for ingredient ${index + 1}`}
          list="recipe-units"
          placeholder="Unit"
          autoComplete="off"
          value={row.unit}
          aria-invalid={!!errors[unitKey]}
          onChange={(e) => onChange({ unit: e.target.value })}
          className={cn(controlClass, 'w-28')}
        />
        <Toggle pressed={row.isOptional} onPressedChange={(isOptional) => onChange({ isOptional })}>
          Optional
        </Toggle>
        <Toggle pressed={row.isGarnish} onPressedChange={(isGarnish) => onChange({ isGarnish })}>
          Garnish
        </Toggle>
      </div>

      {rowError && <FieldError>{rowError}</FieldError>}
    </div>
  );
}

type ToggleProps = { pressed: boolean; onPressedChange: (pressed: boolean) => void; children: string };
function Toggle(props: ToggleProps) {
  const { pressed, onPressedChange, children } = props;

  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        'h-9 rounded-full border px-3 text-sm transition-colors',
        pressed ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700',
        focusRing
      )}
    >
      {children}
    </button>
  );
}
