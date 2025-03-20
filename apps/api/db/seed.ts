import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { reset, seed } from 'drizzle-seed';

import '~/env';
import * as schema from '~/database/schema';
import ingr from './seed/ingr.json';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  await reset(db, schema);

  await seed(db, schema).refine(fake => ({
    users: {
      columns: {},
      count: 5,
      with: {
        ingredients: 5
      }
    },
    ingredients: {
      columns: {
        name: fake.valuesFromArray({
          values: ingr,
        }),
      },
    },
  }));

  await pool.end();
}

main();
