import { createRouter } from '~/utils/router';
import { BarSettingsScreen } from './index';
import { BarInfoScreen } from './info';
import { BarVisibilityScreen } from './visibility';

export const barSettingsRoutes = createRouter([
  {
    path: 'settings',
    children: [
      { index: true, Component: BarSettingsScreen },
      { path: 'info', Component: BarInfoScreen },
      { path: 'visibility', Component: BarVisibilityScreen },
    ],
  },
]);
