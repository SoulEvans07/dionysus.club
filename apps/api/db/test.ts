import { drizzle } from 'drizzle-orm/node-postgres';
import { and, eq, or } from 'drizzle-orm';
import pg from 'pg';

import '~/env';
import * as schema from '~/database/schema';

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  const item = await db.query.ingredients.findMany({
    where: or(
      eq(schema.ingredients.id, '023def20-3f27-4741-99d0-e1ef28c2bd61'),
      eq(schema.users.id, '3e0bb3d0-2074-4a1e-6263-d13dd10cb0cf')
    ),
    with: { owner: true },
  });

  console.log('item', item);

  // const selected = await db
  //   .select()
  //   .from(schema.ingredients)
  //   .fullJoin(schema.users, eq(schema.ingredients.ownerId, schema.users.id))
  //   .where(eq(schema.ingredients.id, '023def20-3f27-4741-99d0-e1ef28c2bd61'));

  // console.log('selected', selected);

  await pool.end();
}

main();
