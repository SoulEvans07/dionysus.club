import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import { Store } from 'lucide-react';

import { hasBarRole, UpdateBarDTO, type BarWithRoleDTO } from '@repo/dtos';
import { Field } from '~/components/form/field';
import { controlClass } from '~/components/common';
import { FormLoading, FormScreen } from '~/components/form/form-screen';
import { ImagePlaceholder } from '~/components/form/image-placeholder';
import { Input } from '~/components/shadcn/input';
import { Textarea } from '~/components/textarea';
import { useBar, useUpdateBar } from '~/queries/bar';
import { fieldErrors, focusFirstError, type FieldErrors } from '~/utils/form';
import { SettingsNote } from './_menu';

const Params = z.object({ barId: z.string() });

export function BarInfoScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const bar = useBar(barId);
  const backTo = `/bar/${barId}/settings`;

  if (!bar.data) {
    return (
      <FormLoading title="Bar info" backTo={backTo} what="this bar" error={bar.isError} onRetry={() => bar.refetch()} />
    );
  }

  if (!hasBarRole(bar.data.role, 'bartender')) return <Navigate to={backTo} replace />;

  return <BarInfoForm key={bar.data.id} bar={bar.data} backTo={backTo} />;
}

type BarInfoFormProps = { bar: BarWithRoleDTO; backTo: string };
function BarInfoForm(props: BarInfoFormProps) {
  const { bar, backTo } = props;
  const navigate = useNavigate();
  const update = useUpdateBar(bar.id);
  const readOnly = !hasBarRole(bar.role, 'admin');

  const [name, setName] = useState(bar.name);
  const [slogan, setSlogan] = useState(bar.slogan);
  const [description, setDescription] = useState(bar.description);
  const [errors, setErrors] = useState<FieldErrors>({});

  const submit = () => {
    const result = UpdateBarDTO.safeParse({ name, slogan, description });
    if (!result.success) {
      const found = fieldErrors(result.error);
      setErrors(found);
      focusFirstError(found);
      return;
    }

    setErrors({});
    update.mutate(result.data, { onSuccess: () => navigate(backTo, { replace: true }) });
  };

  return (
    <FormScreen
      title="Bar info"
      backTo={backTo}
      isSaving={update.isPending}
      error={update.error?.message}
      readOnly={readOnly}
      onSubmit={submit}
    >
      {readOnly && <SettingsNote>Only the owner and admins can edit the bar info.</SettingsNote>}

      <ImagePlaceholder image={bar.bannerImage} label="Add banner" fallback={Store} />

      <div className="flex items-center gap-4">
        <ImagePlaceholder image={bar.logoImage} label="Add logo" fallback={Store} compact />
        <div>
          <p className="font-medium">Logo</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Shown in the sidebar.</p>
        </div>
      </div>

      <Field label="Name" htmlFor="name" error={errors.name}>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          readOnly={readOnly}
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
          readOnly={readOnly}
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
          readOnly={readOnly}
          aria-invalid={!!errors.description}
          className="rounded-xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        />
      </Field>
    </FormScreen>
  );
}
