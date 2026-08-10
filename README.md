# jom-mancing-contract

Shared Zod schemas for the API contract between `Jom-Mancing-App` (Expo) and
`Jom-Mancing-Server` (Next.js). Rationale: `Jom-Mancing-App/docs/decision-log.md` #19.

## Why this exists

The two repos have no shared TypeScript project, so a server response shape changing
never used to surface as a compile error in the app — it would only show up as a
runtime bug, usually discovered late. This package makes the contract code instead of
convention: the server validates requests against these schemas at runtime, and the
app imports the same schemas to get inferred TypeScript types for free.

## Structure

One file per feature slice (`auth.ts`, `kolam.ts`, `map.ts`, ...), each exporting a
Zod schema (and its inferred type) per request/response shape, named after the route:
`RegisterRequest`/`RegisterResponse` for `POST /api/auth/register`, etc. All re-exported
from `src/index.ts`.

Add a new file when a week's feature slice starts (see the week-by-week order in
`Jom-Mancing-App/docs/development-plan.md`), not speculatively ahead of it.

## Using it

**Server** (`Jom-Mancing-Server`): parse incoming request bodies with the schema
before touching Prisma —

```ts
import { RegisterRequest } from 'jom-mancing-contract'

const body = RegisterRequest.parse(await req.json())
```

**App** (`Jom-Mancing-App`): import the inferred type for fetch calls —

```ts
import type { AuthResponse } from 'jom-mancing-contract'

const res: AuthResponse = await (await fetch(`${API_URL}/api/auth/register`, {...})).json()
```

## Consuming this package locally (current setup)

This package is not yet published or pushed to its own GitHub repo. Both
`Jom-Mancing-Server` and `Jom-Mancing-App` currently depend on it via a relative
`file:` path (see each repo's `package.json`), since all three folders sit side by
side under `OneDrive/Documents/Jom Mancing/`. Run `npm run build` in this folder after
any schema change so the compiled `dist/` the other repos import stays current.

**Before the two devs start working from separate machines**, this needs to move to
its own GitHub repo so the `file:` dependency can become a git dependency
(`github:Judo1s/jom-mancing-contract`) — currently an open item, tracked in
`Jom-Mancing-App/docs/development-plan.md`.
