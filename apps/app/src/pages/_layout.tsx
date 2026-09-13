import { Outlet } from 'react-router';

export function RootLayout() {
  return (
    <div className="h-dvh w-dvw overflow-hidden bg-white">
      <Outlet />
    </div>
  );
}
