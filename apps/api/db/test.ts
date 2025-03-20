import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import '~/env';
import * as schema from '~/database/schema';

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  const result = await db.select().from(schema.ingredients);
  console.log('res', result);

  await pool.end();
}

main();
