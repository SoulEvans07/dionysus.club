import { Navigate } from 'react-router';
import { createRouter } from '~/utils/router';
import { Layout } from './_layout';
import { GeneralSettings } from './general';
import { ProfileSettings } from './profile';

export const settingsRouter = createRouter([
  {
    path: 'settings',
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="profile" /> },
      { path: 'profile', Component: ProfileSettings },
      { path: 'general', Component: GeneralSettings },
    ],
  },
]);
