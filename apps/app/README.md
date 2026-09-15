# app.dionysus.club

React 19 SPA for dionysus.club, built with Vite, react-router, TanStack Query, and Tailwind v4. Planned to be a PWA: `public/manifest.json` exists, but there's no service worker yet.

See the root `README.md` for monorepo-wide setup.

## Architecture

- **Routing**: react-router route trees are hand-assembled (not filesystem-based, despite the naming convention). Each route segment directory has some subset of `_router.tsx` (exports the segment's `RouteObject[]`, built with `~/utils/router`'s `createRouter`), `_layout.tsx` (wrapping `Component`), `[param].tsx` for dynamic segments, and `index.tsx` when that segment is itself a real page with actual UI and subpages that justify a folder. `_index.tsx` (underscore-prefixed) is different: it's for an `index: true` component with no real UI of its own that needs to be reused across more than one route tree, e.g. the `NavToBar` redirect. Parent routers import and splice in child routers' exports.
- **Data fetching** follows a three-layer pattern per resource:
  1. `src/api/<resource>.ts` - a class wrapping raw `fetch('/api/...')` calls, parsing responses with the matching `@repo/dtos` schema (throws on non-OK responses).
  2. `src/queries/<resource>.ts` - TanStack Query `queryOptions(...)` factories plus thin `useX` hooks wrapping `useQuery`.
  3. Route `loader`s call `queryClient.query({ ...someQuery, staleTime: 'static' })` (shared `QueryClient` in `src/queries/_client.ts`) to prefetch before a route renders; components then read the same query via the `useX` hook so the loader's cache is reused instead of refetched.
  - `currentUserQuery` (`src/queries/auth.ts`) throws `UnauthorizedError` on 401; route loaders catch that to redirect to `/login`.
- **Styling**: Tailwind v4 (via `@tailwindcss/vite`, no config file) plus shadcn-derived primitives in `src/components/shadcn/`. `src/utils/classnames.ts` (`clsx` + `tailwind-merge`) for conditional classes.
- **`tw` helper** (`src/utils/twElem.tsx`): a styled-components-style factory used throughout `pages/` and `components/` to define one-off elements with baked-in classes, e.g. `const Frame = tw.div('absolute inset-0 ...')`. `tw.<tag>(className, style?)` wraps one of a fixed allowlist of intrinsic tags (extend `supportedTags` in that file for a new tag); `tw.comp(Component, className, style?)` does the same for an existing component. Caller-supplied `className`/`style` props are merged in rather than overridden.

## Environment

Create `apps/app/.env` with:

```
PORT=4000        # optional, defaults to 4000
SERVER_URL=      # the api's URL, e.g. http://localhost:3000 - proxied at /api in dev
```

## Development

```sh
pnpm dev         # vite dev server
pnpm build       # tsc -b && vite build -> dist/
pnpm preview     # preview the built output
```

The dev server proxies `/api/*` requests to `SERVER_URL`, so app code fetches `/api/...` as same-origin regardless of environment. In production and preview (Vercel), the equivalent rewrite is done by `vercel.ts` at the repo root.

## Lint

```sh
pnpm lint
```
