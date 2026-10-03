import { Outlet } from 'react-router';

export function MenuLayout() {
  return (
    <div className="h-dvh w-dvw overflow-y-auto bg-white dark:bg-slate-950">
      <Outlet />
    </div>
  );
}
