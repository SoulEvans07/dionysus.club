# dionysus.club

A bar/cocktail management app: track bars, ingredients, cocktails, and menus, with role-based membership per bar.

## What's inside

A pnpm/Turborepo monorepo:

- **`apps/api`** (`api.dionysus.club`) - [Hono](https://hono.dev/) HTTP API on Node, [Drizzle ORM](https://orm.drizzle.team/) over Postgres, auth via [Kinde](https://kinde.com/).
- **`apps/app`** (`app.dionysus.club`) - React 19 SPA built with Vite, react-router, TanStack Query, and Tailwind v4. Planned to be a PWA (only `public/manifest.json` exists so far, no service worker yet).
- **`libs/dtos`** (`@repo/dtos`) - Zod schemas shared between the api and the app, used for request validation and response typing.
- **`libs/tsconfig`** - shared base `tsconfig.json`.

## Prerequisites

- Node v24 (see `.nvmrc`)
- pnpm 9 (`packageManager` in `package.json`)
- Docker (for local Postgres)

## Setup

```sh
pnpm install
```

Start local Postgres:

```sh
docker compose -f docker/docker-compose.yml up -d
```

This exposes Postgres on host port `7432` (db `dionysus_club`, user `dionysus`, password `postgres`).

Each app needs its own `.env` file - see `apps/api/README.md` and `apps/app/README.md` for the variables each one expects.

Run migrations against the local database:

```sh
pnpm db:migr
```

## Development

```sh
pnpm dev          # run both apps
pnpm dev:api      # api only
pnpm dev:app      # app only
```

By default the app runs on `http://localhost:4000` and proxies `/api/*` to the api (`SERVER_URL` in `apps/app/.env`), which runs on `http://localhost:3000`.

## Other commands

```sh
pnpm build            # build all packages
pnpm lint             # eslint across all packages
pnpm check-types      # tsc --noEmit across all packages
pnpm format           # prettier --write on the whole repo
```

There is no test runner configured in this repo yet.

## Deployment

- **App** (frontend) - Vercel, with separate production and preview environments. `/api/*` requests are rewritten to the api's `SERVER_URL` via `vercel.ts` at the repo root (the same rewrite Vite's dev proxy does locally); every other path falls back to `index.html` for client-side routing.
- **API + Postgres** - Railway, with separate production and preview environments.
