# api.dionysus.club

Hono HTTP API for dionysus.club. Postgres via Drizzle ORM, auth via Kinde.

See the root `README.md` for monorepo-wide setup. Deployed on Railway (separate production and preview environments), alongside its Postgres instance.

## Architecture

- **Routing**: `src/app.ts` mounts one Hono sub-app per resource under `/api` (auth, sidebar, bars, ingredients, cocktails, menus, images). Ingredient/cocktail/menu controllers are mounted twice - nested under `/bars/:barId/...` and flat under `/...` - the controller code handles both shapes.
- **Auth**: Kinde (`src/auth/kinde/`). The `getUser` middleware checks the Kinde session, looks up the local `users` row by `kindeId`, and merges it onto the Kinde profile as `c.var.user`. Chain it before any handler that needs the current user.
- **Bar access control**: `src/middleware/bar.ts`'s `getBarWith(withFields?)` resolves the target bar (from the `:barId` route param, or the caller's personal bar when absent), verifies the requester is the owner or a member, and sets `c.var.bar`. Controllers compose `getUser` + `getBarWith()`, then do their own role checks for anything beyond plain membership (see `getBarRole`/`isBarAdmin` in `src/controllers/bar.ts`).
- **Database**: `src/database/index.ts` exports the `db` instance, `schema`, table objects, and `sql` - import from `~/database` rather than directly from `drizzle-orm`. Schema files live in `src/database/schema/*`.
- **Entity conventions**: `src/database/entity.ts` provides `identifiable()` (uuid PK), `entity()` (+ `createdAt`/`updatedAt`/`deletedAt`), and `fullEntity()` (+ `createdById`/`updatedById`/`deletedById`). Spread these into new `pgTable` definitions. Deletes are soft - filter with `isNull(<table>.deletedAt)` rather than actually deleting rows.
- **Validation**: request bodies are validated with `@hono/zod-validator`'s `zValidator('json', SomeDTO)` using schemas from `@repo/dtos`; responses are typically re-validated with `SomeDTO.parse(...)` before `c.json(...)`.

## Environment

Create `apps/api/.env` with:

```
PORT=3000                # optional, defaults to 3000
CLIENT_URL=              # origin allowed by CORS (the app's dev/prod URL)
DATABASE_URL=            # postgres connection string

KINDE_DOMAIN=
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_REDIRECT_URI=
KINDE_LOGOUT_REDIRECT_URI=
```

These are validated at startup (`src/env.ts`) - the process will fail fast if any required variable is missing.

## Development

```sh
pnpm dev          # nodemon + ts-node, watches src/
pnpm build        # tsup -> dist/
pnpm start        # run the built output (dist/index.js)
```

## Database

Schema lives in `src/database/schema/*`, aggregated in `src/database/schema/index.ts`. Drizzle config is `drizzle.config.ts`.

```sh
pnpm migr:gen       # generate a migration from schema changes
pnpm migr:gen:mty   # generate an empty/custom migration
pnpm db:migr        # run migrations
pnpm db:push        # push schema directly to the db (no migration file)
pnpm db:studio      # open Drizzle Studio
pnpm db:seed        # run db/seed.ts
pnpm db:pull        # introspect an existing db into schema, then format migrations
pnpm db:check       # validate migrations
```

## Lint

```sh
pnpm lint
```

Uses `eslint-plugin-hono` (route-shape checks) and `eslint-plugin-drizzle` in addition to the standard TypeScript rules.
