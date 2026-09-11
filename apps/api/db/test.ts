import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import pg from 'pg';

import '~/env';
import * as schema from '~/database/schema';

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  const item = await db.query.ingredients.findMany({
    where: eq(schema.ingredients.id, '023def20-3f27-4741-99d0-e1ef28c2bd61'),
    with: { bar: true },
  });

  console.log('item', item);

  await pool.end();
}

main();
