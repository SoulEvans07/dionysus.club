import { useMemo, useState } from 'react';
import './App.css';
import { TestType } from '@repo/dtos';

function App() {
  const [data, setData] = useState({ name: '' });

  const { name } = useMemo(() => TestType.parse(data), [data.name]);

  return (
    <div className="card">
      <input type="text" value={name} onChange={e => setData({ name: e.target.value })} />
      <p>Hi {name}!</p>
    </div>
  );
}

export default App;
