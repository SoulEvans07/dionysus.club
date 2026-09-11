import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { reset } from 'drizzle-seed';

import '~/env';
import * as schema from '~/database/schema';
import users from './seed/users.json';
import ingr from './seed/ingr.json';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  await reset(db, schema);

  const seededUsers = await db
    .insert(schema.users)
    .values(
      users.map(({ username }) => ({
        kindeId: `seed-${username}`,
        email: `${username}@dionysus.club`,
        username,
      }))
    )
    .returning();

  for (const user of seededUsers) {
    const [personalBar] = await db
      .insert(schema.bars)
      .values({
        ownedBy: user.id,
        name: `${user.username}'s Bar`,
        barType: 'personal',
        createdById: user.id,
        updatedById: user.id,
      })
      .returning();

    await db.insert(schema.barUsers).values({
      barId: personalBar.id,
      userId: user.id,
      role: 'admin',
    });

    await db.insert(schema.ingredients).values(
      ingr.map((name) => ({
        barId: personalBar.id,
        name,
        createdById: user.id,
        updatedById: user.id,
      }))
    );
  }

  await pool.end();
}

main();
