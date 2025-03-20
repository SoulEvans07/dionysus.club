import { type Config } from 'drizzle-kit';

import '~/env';

export default {
  schema: './src/database/schema',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config;
