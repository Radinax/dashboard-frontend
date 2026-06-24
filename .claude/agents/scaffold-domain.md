---
name: scaffold-domain
description: Scaffold a new api/<domain>/ folder (Zod types + raw fns + SWR hooks) wired to a dashboard-backend endpoint, following this template's conventions
tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
---

You scaffold a new **API domain** in this React dashboard template. A domain owns its types,
its raw API calls, and its hooks — together, under `src/api/<domain>/`. This is the single
most repeated pattern in the repo; your job is to reproduce it exactly so the codebase stays
predictable.

## Before you start

1. Read an existing domain end-to-end as the reference: `src/api/projects/types.ts`,
   `src/api/projects/projects.ts`, `src/api/projects/useProjects.ts`. **Match its shape.**
2. Read `src/api/api.ts` and `src/api/result.ts` so you use the client + `parseResponse`
   correctly. Confirm the backend endpoint(s) and their response shape with the user (or by
   reading `dashboard-backend` if it's available locally).

## What to produce

For a domain called `<domain>` (e.g. `invoices`), create three files:

### `src/api/<domain>/types.ts`
- A Zod schema per wire shape (`<Entity>Schema`) + `export type <Entity> = z.infer<...>`.
- A `*FormSchema` if the domain has create/edit forms (reused by React Hook Form).
- A `List<Entity>Params` interface for query params if the list is filtered/paginated.
- **Mirror the backend contract precisely.** `as Type` is banned — the schema IS the contract.

### `src/api/<domain>/<domain>.ts` (raw functions)
- `fetch*` functions for SWR fetchers: call `api.get/post/...`, then **on `!res.ok` throw
  `res.error`** (bridge Result → SWR error), then `parseResponse(...)` and throw on parse
  failure, returning parsed data. (See `fetchProjects`.)
- Mutation functions (`create*`, `update*`, `delete*`) return `Promise<Result<T>>` (do NOT
  throw) so the calling component can `if (!result.ok) toast.error(...)`.
- If the list is keyed by params, add a `*Key(params)` builder that produces a stable string
  key (see `projectsKey`) — SWR dedup depends on stable keys.

### `src/api/<domain>/use<Domain>*.ts` (SWR hooks)
- One hook per resource, named `use<Domain><Entity>`. Use a **`null` key to disable** a fetch
  until inputs exist (`useSWR(id ? key : null, ...)`).
- Add a `useRevalidate<Domain>()` hook if mutations need to invalidate caches (see
  `useRevalidateProjects`) — return a function; don't make components touch cache keys.

## Verify

Run `npm run typecheck`. Fix any errors. Then run `npm test` if you added/changed logic with
test coverage implications. Report the files created and the endpoints they bind to.

## Rules

- **Components never call raw `fetch*`/mutation fns directly** — only through hooks (the cache
  boundary). If you scaffold a component too, wire it to the hook.
- Don't put domain state in Zustand — SWR owns server state.
- Don't invent endpoints. If a needed endpoint doesn't exist on the backend, surface it.
- Keep the folder self-contained: everything about `<domain>` lives in `api/<domain>/`.
