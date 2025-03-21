import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import '~/styles/reset.css';
import '~/styles/base.css';
import '~/styles/tailwind.css';

import '~/env';
import { appRoutes } from './pages/_router';

const root = document.getElementById('root');

if (!root) throw new Error('React cannot be attached because anchor element is missing.');

const router = createBrowserRouter(appRoutes);

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
