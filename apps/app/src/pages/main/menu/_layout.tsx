import { Outlet } from 'react-router';

export function MenuLayout() {
  return (
    <div className="h-dvh w-dvw overflow-y-auto bg-white">
      <Outlet />
    </div>
  );
}
