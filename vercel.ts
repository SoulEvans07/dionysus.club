import { routes, deploymentEnv, type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  rewrites: [
    routes.rewrite('/api/:match*', `${deploymentEnv('SERVER_URL')}/api/:match*`),
    routes.rewrite('/((?!api).*)', '/index.html'),
  ],
};
