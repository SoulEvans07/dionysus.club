import { createRouter } from '~/utils/router';
import { queryClient } from '~/queries/_client';
import { ProfileLayout } from './_layout';
import { ProfileScreen } from './index';
import { currentUserQuery } from '~/queries/auth';

export const profileRoutes = createRouter([
  {
    path: 'profile',
    Component: ProfileLayout,
    loader,
    children: [{ index: true, Component: ProfileScreen }],
  },
]);

async function loader() {
  await queryClient.query({ ...currentUserQuery, staleTime: 'static' });
}
