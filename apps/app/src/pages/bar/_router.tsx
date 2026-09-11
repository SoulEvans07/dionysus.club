import { createRouter } from '~/utils/router';
import { BarLayout } from './_layout';
import { BarScreen } from './index';

export const barRoutes = createRouter([
  {
    path: 'bar',
    Component: BarLayout,
    children: [{ index: true, Component: BarScreen }],
  },
]);
