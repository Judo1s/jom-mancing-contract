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

## Consuming this package

Hosted at `github.com/Judo1s/jom-mancing-contract`. Both `Jom-Mancing-Server` and
`Jom-Mancing-App` depend on it as a git dependency:

```json
"jom-mancing-contract": "github:Judo1s/jom-mancing-contract"
```

`dist/` is gitignored — it is not committed. The `prepare` script (`tsc`) runs
automatically when npm installs a git dependency, so `npm install` in either
consuming repo builds it fresh from `src/`. After changing a schema here, commit and
push, then run `npm install jom-mancing-contract` (or delete-and-reinstall
`node_modules/jom-mancing-contract`) in the consuming repo to pick up the change —
npm does not auto-update git dependencies on a plain `npm install` once the commit is
already cached locally.
