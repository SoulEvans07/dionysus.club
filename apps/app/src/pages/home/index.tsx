import { useEffect, useState } from 'react';
import { Ingredient } from '@repo/dtos';
import { Input } from '~/components/shadcn/input';

const apiUrl = import.meta.env.VITE_SERVER_URL;

export function HomePage() {
  const refresh = async () => {
    const list = await fetch(`${apiUrl}/ingredients/list`)
      .then((res) => res.json())
      .then((data) => Ingredient.array().parse(data));
    setList(list);
  };

  const [list, setList] = useState<Ingredient[]>([]);
  useEffect(() => void refresh(), []);

  const [id, setId] = useState('');
  const [item, setItem] = useState<Ingredient | null>(null);
  useEffect(() => {
    if (id === '') {
      setItem(null);
    } else {
      fetch(`${apiUrl}/ingredients/${id}`)
        .then((res) => res.json())
        .then((data) => Ingredient.parse(data))
        .then((item) => setItem(item));
    }
  }, [id]);

  return (
    <div className="bg-slate-900 p-4">
      <button onClick={() => refresh()}>Refresh</button>
      <Input type="text" value={id} onChange={(e) => setId(e.target.value)} />
      <pre>{JSON.stringify(item, undefined, 2)}</pre>

      <hr />
      <div>
        {list.map((o) => (
          <pre key={o.id} onClick={() => setId(o.id)}>
            {JSON.stringify(o, undefined, 2)}
          </pre>
        ))}
      </div>
    </div>
  );
}
