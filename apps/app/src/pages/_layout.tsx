import { Link, Outlet } from 'react-router';
import { tw } from '~/utils/twElem';

export function RootLayout() {
  return (
    <div className="h-full overflow-hidden bg-slate-950">
      <nav className="flex h-[4rem] flex-row items-center gap-2 p-2">
        <button className="mr-auto flex text-3xl font-bold">Logo</button>
        <NavBtn href="/home">Home</NavBtn>
        <NavBtn href="/settings">Settings</NavBtn>
      </nav>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

const NavBtn = tw.a('bg-slate-700 text-slate-100 px-4 h-full flex justify-center items-center rounded-sm');
// const NavBtn = tw.comp(Link, 'bg-slate-700 text-slate-100 px-4 h-full flex justify-center items-center');
