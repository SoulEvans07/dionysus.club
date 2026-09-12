import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';

import '~/styles/reset.css';
import '~/styles/base.css';
import '~/styles/tailwind.css';

import '~/env';
import { appRoutes } from './pages/_router';
import { queryClient } from './queries/_client';

const root = document.getElementById('root');

if (!root) throw new Error('React cannot be attached because anchor element is missing.');

const router = createBrowserRouter(appRoutes);

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
