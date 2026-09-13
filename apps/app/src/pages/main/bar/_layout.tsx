import { Outlet } from 'react-router';
import { MainSidebar } from '~/components/sidebar';
import { sizes } from '~/styles/constants';

const style: React.CSSProperties = {
  marginLeft: sizes.mainSidebarGuard,
};

export function BarLayout() {
  return (
    <div className="h-dvh w-dvw overflow-y-auto" style={style}>
      <MainSidebar />
      <Outlet />
    </div>
  );
}
