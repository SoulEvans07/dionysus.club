import { createRouter } from '~/utils/router';
import { MemberListScreen } from './index';
import { MemberAddScreen } from './new';

export const barMembersRoutes = createRouter([
  {
    path: 'members',
    children: [
      { index: true, Component: MemberListScreen },
      { path: 'new', Component: MemberAddScreen },
    ],
  },
]);
