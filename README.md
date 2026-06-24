# dashboard-frontend

A modern **React dashboard template** — the frontend half of a full-stack base. Pairs with
**`dashboard-backend`** (Hono + SQLite API) but is a standalone SPA. Built to the structure
from _"Structuring a Frontend Repo in 2026"_: domain-driven folders, the SWR/Zustand state
split, a Zod-validated API boundary, and clear shadcn component layers.

## Stack (2026)

| Concern | Choice |
| --- | --- |
| UI + build | **React 19**, **TypeScript**, **Vite** |
| Routing | **TanStack Router** (typed, file-based, auto code-split) |
| Server state | **SWR** (data fetching + cache) |
| Client state | **Zustand** (UI/ephemeral; `persist` for the sidebar) |
| Validation | **Zod** at the wire boundary + a `Result`-type API client |
| Forms | **React Hook Form** + Zod (`zodResolver`) |
| Styling | **Tailwind v4** + **shadcn/ui** primitives |
| Data viz / UX | **Recharts**, **Sonner** (toasts), **TanStack Table**, **Lucide**, **date-fns** |
| Tooling | **Biome** (lint+format), **Vitest** + **Testing Library** + **MSW** |

## Getting started

```bash
pnpm install              # or npm install
cp .env.example .env       # VITE_API_URL — defaults to the dev proxy "/api"
pnpm dev                   # http://localhost:5173
```

Run **`dashboard-backend`** alongside it (`pnpm dev` there → `:8787`). Vite proxies `/api`
to the backend (see `vite.config.ts`), so the browser stays same-origin and the httpOnly
refresh cookie flows. Sign in with the backend's seeded demo account
(`demo@example.com` / `password123`) or register a new one.

## Scripts

- `pnpm dev` — Vite dev server (HMR; regenerates the route tree).
- `pnpm build` — `tsr generate` → `tsc --noEmit` → `vite build`.
- `pnpm typecheck` / `pnpm check` / `pnpm check:fix` — types / Biome / Biome --write.
- `pnpm test` / `pnpm test:watch` — Vitest.

## Structure

```
src/
  api/                  # one folder per domain (the cache + validation boundary)
    api.ts              #   the single Result-type client (auth header, 401-refresh, errors)
    result.ts           #   Result<T>, ApiError, parseResponse (Zod at the edge)
    auth/  projects/  dashboard/    #   types.ts (Zod) · <domain>.ts (raw fns) · use*.ts (SWR)
  components/
    ui/                 # shadcn primitives — treat as immutable
    blocks/             # compound components composed from ui/ (SubmissionButton, StatusBadge)
  routes/               # file-based routes (TanStack Router)
    __root.tsx  index.tsx  sign-in.tsx
    _authed.tsx         #   pathless layout that guards auth
    _authed/            #   dashboard.tsx · projects.tsx
      -components/      #   route-local (the `-` prefix is ignored by the router)
  lib/
    stores/             # Zustand (useAuthStore in-memory, useSidebarStore persisted)
    hooks/  utils.ts
  context/  config.ts  styles.css  main.tsx
```

## The architectural seams (why it's shaped this way)

- **Server vs client state.** SWR owns anything from the network (projects, dashboard
  stats, the session); Zustand owns UI state (sidebar, the in-memory access token). Data
  never gets copied across the line.
- **Validated boundary.** Every response is parsed with Zod via `parseResponse`; the client
  returns a `Result` instead of throwing, so callers handle both paths and a drifted wire
  shape surfaces as a loud `schema_validation_failed` rather than `undefined is not a function`.
- **Auth.** The access token lives in memory (`useAuthStore`), the refresh token in an
  httpOnly cookie. On boot the app silently calls `/auth/refresh` to restore the session; on
  a 401 the client refreshes once and replays the request. All wired in `context/auth.tsx`.
- **Component layers.** `ui/` (shadcn, immutable) → `blocks/` (your reusable compounds) →
  `routes/.../-components/` (route-local). Compose; don't fork a primitive.

## Testing

```bash
pnpm test
```

Vitest + happy-dom, mocking the network with **MSW** at the API boundary (`src/test/msw/`).
Coverage maps onto the structure: the `Result`/Zod mapping and the Zustand store are unit
tested; SWR hooks are tested in isolation against MSW (including the schema-drift and
error-envelope paths); shared components render with the providers helper
(`src/test/test-utils.tsx`). See `CLAUDE.md` for conventions.

## Connecting to the backend

Point `VITE_API_URL` at the API (dev: `/api` via the proxy; prod: the deployed origin, e.g.
`https://api.example.com/api`). The frontend mirrors the backend's contracts as Zod schemas
in each `api/<domain>/types.ts` — the single source of truth for both the runtime check and
the static type.
