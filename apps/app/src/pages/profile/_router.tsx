import { createRouter } from '~/utils/router';
import { ProfileLayout } from './_layout';
import { ProfileScreen } from './index';

export const profileRoutes = createRouter([
  {
    path: 'profile',
    Component: ProfileLayout,
    children: [{ index: true, Component: ProfileScreen }],
  },
]);
