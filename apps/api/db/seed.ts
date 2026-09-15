import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { reset } from 'drizzle-seed';
import { ne } from 'drizzle-orm';

import '~/env';
import * as schema from '~/database/schema';
import { SYSTEM_USER_ID, SYSTEM_BAR_ID } from '~/database/constants';
import users from './seed/users.json';
import ingredients from './seed/ingredients.json';
import cocktailsData from './seed/cocktails.json';
import images from './seed/images.json';
import { defaultTags } from './seed/tags';

const imagesByName = new Map(images.map((image) => [image.name, image]));

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // users/bars are reset separately below so the system user/bar (seeded by a migration,
  // fixed ids in ~/database/constants) survive a reseed instead of being truncated away.
  const { users: _users, bars: _bars, ...resettableSchema } = schema;
  await reset(db, resettableSchema);
  await db.delete(schema.bars).where(ne(schema.bars.id, SYSTEM_BAR_ID));
  await db.delete(schema.users).where(ne(schema.users.id, SYSTEM_USER_ID));

  await db.insert(schema.tags).values(
    defaultTags.map((tag) => ({
      ...tag,
      barId: SYSTEM_BAR_ID,
      createdById: SYSTEM_USER_ID,
      updatedById: SYSTEM_USER_ID,
    }))
  );

  async function seedImage(name: string, ownerId: string) {
    const image = imagesByName.get(name);
    if (!image) return null;

    const [blob] = await db
      .insert(schema.imageBlobs)
      .values({ filename: image.name, url: image.url, createdById: ownerId, updatedById: ownerId })
      .returning();

    return blob.id;
  }

  const seededUsers = await db.insert(schema.users).values(users).returning();

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

    const ingredientIdByName = new Map<string, string>();

    for (const ingredient of ingredients) {
      const imageId = await seedImage(ingredient.image.url, user.id);

      const [row] = await db
        .insert(schema.ingredients)
        .values({
          barId: personalBar.id,
          name: ingredient.name,
          iconImageId: imageId,
          cardImageId: imageId,
          createdById: user.id,
          updatedById: user.id,
        })
        .returning();

      ingredientIdByName.set(ingredient.name, row.id);
    }

    const [menu] = await db
      .insert(schema.menus)
      .values({ barId: personalBar.id, title: 'House Menu', createdById: user.id, updatedById: user.id })
      .returning();

    const groupIdByName = new Map<string, string>();

    for (const cocktail of cocktailsData) {
      const imageId = await seedImage(cocktail.image, user.id);

      const [row] = await db
        .insert(schema.cocktails)
        .values({
          barId: personalBar.id,
          name: cocktail.name,
          iconImageId: imageId,
          cardImageId: imageId,
          createdById: user.id,
          updatedById: user.id,
        })
        .returning();

      await db.insert(schema.recipeItem).values(
        cocktail.recipe.map((item, index) => ({
          cocktailId: row.id,
          ingredientId: ingredientIdByName.get(item.ingredient)!,
          index,
          unit: item.unit,
          quantity: item.quantity,
          isOptional: item.isOptional,
          isGarnish: item.isGarnish,
        }))
      );

      let groupId = groupIdByName.get(cocktail.group);
      if (!groupId) {
        const [group] = await db
          .insert(schema.menuGroups)
          .values({ menuId: menu.id, title: cocktail.group, index: groupIdByName.size })
          .returning();
        groupId = group.id;
        groupIdByName.set(cocktail.group, groupId);
      }

      await db.insert(schema.menuItems).values({ menuId: menu.id, cocktailId: row.id, menuGroupId: groupId });
    }
  }

  // A shared bar (beyond everyone's personal one) to exercise multi-user membership.
  if (seededUsers.length > 1) {
    const [owner, ...members] = seededUsers;

    const [sharedBar] = await db
      .insert(schema.bars)
      .values({
        ownedBy: owner.id,
        name: "The Alchemist's Table",
        slogan: 'Shared bar for the whole crew',
        barType: 'public',
        createdById: owner.id,
        updatedById: owner.id,
      })
      .returning();

    await db
      .insert(schema.barUsers)
      .values(members.map((member) => ({ barId: sharedBar.id, userId: member.id, role: 'bartender' as const })));
  }

  await pool.end();
}

main();
