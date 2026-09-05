# Architecture

## Overview

KMUTT Guesser is a fullstack Next.js application. The App Router owns routing and composition; application logic is separated into core and infrastructure layers.

```text
src/
├── app/                 # Pages, layouts, route handlers, proxy
├── components/          # Reusable UI
├── core/                # Domain, schemas, errors, ports, services
├── infrastructure/      # Prisma repositories, factories, composition root
├── lib/                 # Technical helpers and initialisation
├── routes/              # Shared route constants
├── store/               # Shared client state
└── utils/               # Framework-independent utilities

prisma/
├── schema.prisma        # Database schema
├── seed.mjs             # Reference-data seed
└── types/               # Prisma model and relation payload types

tests/
├── unit/
├── components/
├── integration/
├── e2e/
├── fixtures/
├── mocks/
└── helpers/
```

## Request flow

```text
Client Component
      │ HTTP request
      ▼
src/app/api/*/route.ts
      │
      ▼
Core Service ──► Core Port ──► Infrastructure Repository ──► Prisma / PostgreSQL
      │
      ▼
Infrastructure Factory ──► Core Domain output
```

Server Components and server-only code may call a service from `src/infrastructure/container.ts` directly. Client-side code must call `/api` through `src/lib/http.ts`; it must not import services or Prisma.

## Layer ownership

| Location | Responsibility |
| --- | --- |
| `src/app` | Route-specific concerns, pages, layouts, route handlers, cookies, and HTTP responses. Keep it thin. |
| `src/components` | Reusable UI. Use Server Components by default; add a client boundary only for browser interaction or state. |
| `src/core/domain` | Public application models and domain rules. It must not contain Prisma or UI concerns. |
| `src/core/schema` | Zod validation schemas and inferred input types. |
| `src/core/errors` | Application errors such as `AppError`. |
| `src/core/ports` | Contracts that services require from persistence. |
| `src/core/service` | Business logic, validation, authorization decisions, and orchestration. |
| `src/infrastructure/repositories` | Prisma queries only. Repositories return the Prisma records requested by their ports. |
| `src/infrastructure/factories` | Maps Prisma records to public domain output. Factories remove sensitive fields. |
| `src/infrastructure/container.ts` | Creates repository and service instances. |
| `src/lib` | Technical helpers: Prisma global instance, password hashing, API response formatting, validation parsing, auth checks, and client HTTP setup. |
| `prisma/types` | Prisma-only types for records with included relations. These are not domain models. |

## Auth and session model

- Registration and login are handled by `AuthService`; it validates input with Zod and hashes or verifies passwords through `src/lib/password.ts`.
- `SessionService` creates a random token, stores its expiry in the `Session` table, and resolves the current user from an unexpired token.
- Login writes the `accessToken` cookie in the route handler. `authCheck()` reads it server-side and throws a 401 `AppError` when no valid session exists.
- `roleCheck()` receives an authenticated domain user and throws 403 when its role is not allowed.
- `UserFactory.public()` is the boundary that returns only `id`, `name`, `email`, and `role`; passwords must never cross it.

## Persistence and local services

- Prisma client is initialised once in `src/lib/prisma.ts` with a global instance.
- Roles are reference data seeded by `prisma/seed.mjs`; they do not have their own service or repository.
- `docker-compose.yml` runs PostgreSQL for local development.
- `.env` contains local values and is ignored. `.env.example` lists required variables only.
