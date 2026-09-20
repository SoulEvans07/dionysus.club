import { useMemo } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { z } from 'zod';

import { useIngredientList } from '~/queries/ingredient';
import { useTagList } from '~/queries/tag';
import { cn } from '~/utils/classnames';
import { tagFullKey } from '~/utils/tags';
import { tw } from '~/utils/twElem';

const Params = z.object({ barId: z.string() });
const QueryParams = z.object({ tag: z.string().optional() });

export function IngredientListScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const [query] = useSearchParams();
  const { tag } = useMemo(() => QueryParams.parse(Object.fromEntries(query.entries())), [query]);

  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const list = useIngredientList(barId, { tag });

  if (list.isPending) return <Frame>Loading...</Frame>;
  if (list.error) return <Frame>Error</Frame>;

  return (
    <Frame>
      <button onClick={goBack}>Back</button>
      <h1>Ingredients</h1>
      {tag && <TagTitle barId={barId} tagKey={tag} />}
      {list.data.map((ingr) => (
        <div key={ingr.id} className="p-2" onClick={() => navigate(`/bar/${barId}/ingredients/${ingr.id}`)}>
          <div>{ingr.name}</div>
          <div>{ingr.description}</div>
          <div>{ingr.available ? 'Available' : 'Unavailable'}</div>
        </div>
      ))}
    </Frame>
  );
}

const Frame = tw.div('z-100 absolute left-0 right-0 top-0 h-dvh w-dvw overflow-y-auto bg-white');

type TagTitleProps = { barId: string; tagKey: string };
function TagTitle(props: TagTitleProps) {
  const { barId, tagKey: tagKey } = props;

  const list = useTagList(barId);
  const tag = useMemo(() => list.data?.find((tag) => tagFullKey(tag) === tagKey), [list.data, tagKey]);
  if (list.isSuccess && list.data && tag === undefined) return <Navigate to={`/bar/${barId}`} />;

  return <div className={cn({ skeleton: list.isPending })}>{tag?.name ?? 'tag'}</div>;
}
