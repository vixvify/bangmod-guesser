# Architecture

## Overview

KMUTT Guesser is a fullstack Next.js application. The App Router owns routing and composition; application logic is separated into core and infrastructure layers.

```text
src/
├── app/                         # App Router
├── components/                  # Reusable UI
├── config/                      # Runtime configuration
├── core/
│   ├── constants/
│   ├── domain/
│   ├── errors/
│   ├── ports/
│   ├── schema/
│   └── service/
├── infrastructure/
│   ├── factories/
│   ├── interface/
│   ├── repositories/
│   └── container
├── layout/                      # Page-level composition
├── lib/                         # Technical helpers and initialisation
├── routes/                      # Shared route constants
└── store/                       # Shared client state

prisma/
└── types/                       # Prisma-specific types

public/
└── images/                      # Static image assets

tests/
├── unit/
├── components/
├── integration/
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
| `src/config` | Shared application configuration. It exports the API base URL and server runtime configuration; application code consumes it instead of reading `process.env` directly. |
| `src/components` | Reusable UI. Use Server Components by default; add a client boundary only for browser interaction or state. |
| `src/core/domain` | Public application models and domain rules, including the `UserRole` authorization enum. It must not contain Prisma or UI concerns. |
| `src/core/schema` | Zod validation schemas and inferred input types. |
| `src/core/errors` | Application errors such as `AppError`. |
| `src/core/ports` | Contracts that services require from persistence or external storage. |
| `src/core/service` | Business logic, validation, authorization decisions, and orchestration. |
| `src/infrastructure/repositories` | Prisma queries and external storage operations. Repositories return the values requested by their ports. |
| `src/infrastructure/factories` | Maps Prisma records to public domain output, including Prisma role enum values to domain `UserRole`. Factories remove sensitive fields. |
| `src/infrastructure/container.ts` | Creates repository and service instances. |
| `src/lib` | Technical helpers: Prisma global instance, password hashing, API response formatting, validation parsing, auth checks, and client HTTP setup. |
| `prisma/types` | Prisma-only types for records with included relations. These are not domain models. |

## Auth and session model

- Registration and login are handled by `AuthService`; it validates input with Zod and hashes or verifies passwords through `src/lib/password.ts`.
- `SessionService` creates a random token, stores its expiry in the `Session` table, and resolves the current user from an unexpired token.
- Login writes the `accessToken` cookie in the route handler. `authCheck()` reads it server-side and throws a 401 `AppError` when no valid session exists.
- `roleCheck()` receives an authenticated domain user and a list of `UserRole` values; it throws 403 when its role is not allowed.
- `UserFactory.public()` is the boundary that returns only `id`, `name`, `email`, and `role`; passwords must never cross it.

## Persistence and local services

- Prisma client is initialised once in `src/lib/prisma.ts` with a global instance.
- User roles are represented by the Prisma `Role` enum with `USER` and `ADMIN` values; there is no role table, service, repository, or seed data.
- The role-table-to-enum change uses `prisma db push --force-reset` because this project has no migration directory; resetting the development database removes existing data.
- `docker-compose.yml` runs PostgreSQL for local development.
- `.env` contains local values and is ignored. `.env.example` lists required variables only.

## Image storage

- `ImageService` owns generated keys and public domain output; `UploadImageSchema` and `DeleteImageSchema` validate route input before the service is called.
- `ImageRepository` is the core contract; `ImageRepositoryImpl` sends put/delete operations to Cloudflare R2 and builds the public object URL.
- `/api/images` accepts `POST` multipart form data with a `file` field and `DELETE` JSON with an object `key`. Both require `ADMIN` through `authCheck()` and `roleCheck()`.
- Uploads are limited to verified JPEG, PNG, or WebP content up to 5 MB and are stored under the `images/` namespace. The service returns `{ key, url }` so a future domain module can persist either value.
- R2 credentials remain server-only in `.env`. Configuration is resolved lazily, so missing R2 values do not fail build or tests; image requests return a safe configuration error instead.
