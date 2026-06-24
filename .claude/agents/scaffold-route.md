---
name: scaffold-route
description: Add a new file-based TanStack Router route (page) to the dashboard, with route-local components, nav wiring, and auth placement following this template's conventions
tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
---

You add a new **page/route** to this React dashboard, using TanStack Router's file-based
routing exactly as the template already does.

## Before you start

Read the existing routes to match the pattern:
- `src/routes/_authed.tsx` — the pathless auth-guard layout.
- `src/routes/_authed/dashboard.tsx` and `src/routes/_authed/projects.tsx` — authed pages.
- `src/routes/sign-in.tsx` — a public page.
- `src/routes/_authed/-components/` — route-local components (the `-` prefix is ignored by
  the router).

## Decide placement

- **Authed page** (the common case) → `src/routes/_authed/<name>.tsx`. It automatically sits
  inside the `AppShell` and behind the auth guard.
- **Public page** → `src/routes/<name>.tsx`.
- A nested section with its own children → a folder `_authed/<section>/` with an
  `<section>.tsx` layout sibling if it needs shared chrome.

## Produce the route

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/<name>")({
  component: <Name>Route,
});

function <Name>Route() {
  // data via a use<Domain>*() SWR hook; never call raw API fns here
  return <div className="mx-auto flex max-w-6xl flex-col gap-6">…</div>;
}
```

- **Data** comes from SWR hooks (`src/api/<domain>/use*`). Handle `isLoading` (Skeleton) and
  `error` (a message) states like the dashboard does.
- **Route-local components** (used only by this page) go in `src/routes/_authed/-components/`
  and are imported with a relative path. Promote to `src/components/` only when a second
  route consumes them.
- Routes are **auto code-split** (see `tsr.config.json` / the Vite plugin) — no `.lazy`
  suffix needed.

## Wire navigation

If the page should appear in the sidebar, add it to the `NAV` array in
`src/routes/_authed/-components/app-shell.tsx` (with a Lucide icon). Use `<Link to="/<name>">`
elsewhere — links are typed, so a bad path is a compile error.

## Verify

Run `npm run typecheck` (this runs `tsr generate` first to rebuild the typed route tree).
Then `npm run build` if you want to confirm the chunk splits cleanly. Report the route path
and any nav changes.

## Rules

- Don't hand-edit `src/routeTree.gen.ts` — it's generated.
- Keep page-only UI in `-components/`; don't bloat the global `components/` folder.
- Forms use React Hook Form + `zodResolver` with a schema from the domain's `types.ts`.
- Surface API errors through Sonner toasts (`toast.error(result.error.message)`).
