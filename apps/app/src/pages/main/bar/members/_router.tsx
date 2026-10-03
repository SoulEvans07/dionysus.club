import { createRouter } from '~/utils/router';
import { MemberListScreen } from './index';

export const barMembersRoutes = createRouter([
  {
    path: 'members',
    children: [{ index: true, Component: MemberListScreen }],
  },
]);
