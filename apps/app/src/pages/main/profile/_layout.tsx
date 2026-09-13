import { Outlet } from 'react-router';

export function ProfileLayout() {
  return (
    <div className="h-dvh w-dvw overflow-y-auto">
      <Outlet />
    </div>
  );
}
