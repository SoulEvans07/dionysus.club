import { createRouter } from '~/utils/router';
import { MenuLayout } from './_layout';
import { MenuScreen } from './index';

export const menuRoutes = createRouter([
  {
    path: 'menu',
    Component: MenuLayout,
    children: [{ index: true, Component: MenuScreen }],
  },
]);
