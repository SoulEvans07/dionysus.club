import { createRouter } from '~/utils/router';
import { BarSettingsScreen } from './index';
import { BarInfoScreen } from './info';
import { BarVisibilityScreen } from './visibility';
import { BarTransferScreen } from './transfer';
import { BarTagsScreen } from './tags';
import { TagCreateScreen } from './tags/new';
import { TagEditScreen } from './tags/edit';

export const barSettingsRoutes = createRouter([
  {
    path: 'settings',
    children: [
      { index: true, Component: BarSettingsScreen },
      { path: 'info', Component: BarInfoScreen },
      { path: 'visibility', Component: BarVisibilityScreen },
      { path: 'transfer', Component: BarTransferScreen },
      {
        path: 'tags',
        children: [
          { index: true, Component: BarTagsScreen },
          { path: 'new', Component: TagCreateScreen },
          { path: ':id', Component: TagEditScreen },
        ],
      },
    ],
  },
]);
