import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { reset } from 'drizzle-seed';

import { SYSTEM_USER_ID, SYSTEM_BAR_ID } from '@repo/dtos';
import '~/env';
import * as schema from '~/database/schema';
import users from './seed/users.json';
import ingredients from './seed/ingredients.json';
import cocktailsData from './seed/cocktails.json';
import images from './seed/images.json';
import { defaultTags, getCocktailTagRefs, getIngredientTagRefs, tagRef } from './seed/tags';

const imagesByName = new Map(images.map((image) => [image.name, image]));

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  await reset(db, schema);

  // reset() truncates the system user/bar too - `users`/`bars` reference `imageBlobs`
  // (profile/logo/banner image), and truncate CASCADE sweeps in any table referencing a
  // truncated one, so excluding just users/bars from reset() isn't enough on its own.
  // Recreate them with their fixed ids before anything below depends on them.
  // (same rows as db/migrations/0003_seed_system_user_and_bar.sql)
  await db.insert(schema.users).values({
    id: SYSTEM_USER_ID,
    kindeId: '_system',
    email: 'system@dionysus.club',
    username: '_system',
  });
  await db.insert(schema.bars).values({
    id: SYSTEM_BAR_ID,
    ownedBy: SYSTEM_USER_ID,
    name: 'System',
    barType: 'system',
    createdById: SYSTEM_USER_ID,
    updatedById: SYSTEM_USER_ID,
  });

  const seededTags = await db
    .insert(schema.tags)
    .values(
      defaultTags.map((tag) => ({
        ...tag,
        barId: SYSTEM_BAR_ID,
        createdById: SYSTEM_USER_ID,
        updatedById: SYSTEM_USER_ID,
      }))
    )
    .returning();

  const tagIdByRef = new Map(seededTags.map((tag) => [tagRef(tag), tag.id]));
  const resolveTagIds = (refs: string[]) =>
    refs.map((ref) => {
      const id = tagIdByRef.get(ref);
      if (!id) throw new Error(`Unknown seed tag: ${ref}`);
      return id;
    });

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
          description: ingredient.description,
          available: ingredient.available,
          iconImageId: imageId,
          cardImageId: imageId,
          createdById: user.id,
          updatedById: user.id,
        })
        .returning();

      ingredientIdByName.set(ingredient.name, row.id);

      const tagIds = resolveTagIds(getIngredientTagRefs(ingredient.name));
      if (tagIds.length) {
        await db.insert(schema.ingredientTags).values(tagIds.map((tagId) => ({ ingredientId: row.id, tagId })));
      }
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
          description: cocktail.description,
          iconImageId: imageId,
          cardImageId: imageId,
          createdById: user.id,
          updatedById: user.id,
        })
        .returning();

      const cocktailTagIds = resolveTagIds(
        getCocktailTagRefs(
          cocktail.name,
          cocktail.recipe.map((item) => item.ingredient)
        )
      );
      if (cocktailTagIds.length) {
        await db.insert(schema.cocktailTags).values(cocktailTagIds.map((tagId) => ({ cocktailId: row.id, tagId })));
      }

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

      if (cocktail.steps.length) {
        await db
          .insert(schema.recipeSteps)
          .values(cocktail.steps.map((description, index) => ({ cocktailId: row.id, index, description })));
      }

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
