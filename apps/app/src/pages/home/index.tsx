import { ChangeEventHandler, useEffect, useState } from 'react';
import { CreateIngredientDTO, IngredientDTO } from '@repo/dtos';

import { Input } from '~/components/shadcn/input';
import { tw } from '~/utils/twElem';
import { cn } from '~/utils/classnames';

const emptyIngredient: CreateIngredientDTO = {
  name: '',
  description: '',
  available: false,
};

export function HomePage() {
  const refetch = async () => {
    const list = await fetch('/api/ingredients/list')
      .then((res) => res.json())
      .then((data) => IngredientDTO.array().parse(data));
    setList(list);
  };

  const [list, setList] = useState<IngredientDTO[]>([]);
  useEffect(() => void refetch(), []);

  const [id, setId] = useState('');
  const clear = () => setId('');

  const [item, setItem] = useState<IngredientDTO | null>(null);
  useEffect(() => {
    if (id === '') {
      setItem(null);
    } else {
      fetch(`/api/ingredients/${id}`)
        .then((res) => res.json())
        .then((data) => IngredientDTO.parse(data))
        .then((item) => setItem(item));
    }
  }, [id]);

  const [newItem, setNewItem] = useState(emptyIngredient);
  const handleNameChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setNewItem((prev) => ({ ...prev, name: e.target.value }));
  const handleDescrChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setNewItem((prev) => ({ ...prev, description: e.target.value }));
  const handleAvailChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setNewItem((prev) => ({ ...prev, available: e.target.checked }));

  const createIngr = async () => {
    if (newItem.name.length < 1) return;

    await fetch('/api/ingredients/create', {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newItem),
    }).then((res) => res.json());
    setNewItem(emptyIngredient);
    await refetch();
  };

  return (
    <div className="bg-slate-900 p-4">
      <div className="flex flex-col items-start gap-2 p-2">
        <Input id="name" onChange={handleNameChange} value={newItem.name} placeholder="Name" />
        <Input id="description" onChange={handleDescrChange} value={newItem.description} placeholder="Description" />
        <div className="flex flex-row gap-2">
          <span>available</span>
          <input id="available" onChange={handleAvailChange} type="checkbox" checked={newItem.available} />
        </div>
        <Button onClick={() => createIngr()} disabled={newItem.name.length < 1}>
          Create
        </Button>
      </div>
      <hr className="my-4" />
      <div className="flex flex-col items-start gap-2 p-2">
        <div className="flex flex-row gap-2">
          <Button onClick={() => refetch()}>Refresh</Button>
          <Button onClick={() => clear()}>Clear</Button>
        </div>
        <Input type="text" value={id} onChange={(e) => setId(e.target.value)} />
        {item && <Card ingredient={item} />}
      </div>
      <hr className="my-4" />
      <div className="flex flex-col items-start gap-2 p-2">
        {list.map((item) => (
          <Card ingredient={item} onClick={() => setId(item.id)} />
        ))}
      </div>
    </div>
  );
}

const Button = tw.button('bg-indigo-800 text-indigo-100 px-4 py-2 rounded-sm');

function Card(props: { ingredient: IngredientDTO; onClick?: VoidFunction }) {
  const { ingredient, onClick } = props;

  return (
    <div
      className="flex w-full flex-col items-start gap-1 rounded-sm bg-slate-800 p-2"
      key={ingredient.id}
      onClick={onClick}
    >
      <div>{ingredient.name}</div>
      <div className={cn({ 'text-slate-600': !ingredient.description.length })}>
        {ingredient.description.length ? ingredient.description : 'no description'}
      </div>
      <div>available: {ingredient.available ? 'true' : 'false'}</div>
    </div>
  );
}
