import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';

import '~/styles/reset.css';
import '~/styles/base.css';
import '~/styles/tailwind.css';
import '~/styles/custom.css';

import '~/env';
import { appRoutes } from './pages/_router';
import { queryClient } from './queries/_client';
import { useSettings } from './stores/settings';
import { applyAppearance, onSystemThemeChange } from './utils/theme';

const root = document.getElementById('root');

if (!root) throw new Error('React cannot be attached because anchor element is missing.');

// Apply the stored appearance before first render and keep it in sync with settings and the OS theme.
const syncAppearance = () => applyAppearance(useSettings.getState());
syncAppearance();
useSettings.subscribe(syncAppearance);
onSystemThemeChange(syncAppearance);

const router = createBrowserRouter(appRoutes);

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
