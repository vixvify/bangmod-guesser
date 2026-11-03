# Architecture

## Overview

KMUTT Guesser is a fullstack Next.js application. The App Router owns routing and composition. Code is grouped by feature; each feature keeps its business contracts and implementations together.

```text
src/
├── app/                         # App Router pages and API handlers
├── features/                    # Feature-owned UI, domain, services, repositories
│   ├── auth/
│   ├── dashboard/
│   ├── game/
│   ├── home/
│   ├── images/
│   ├── leaderboard/
│   ├── locations/
│   ├── profile/
│   ├── settings/
│   └── users/
├── shared/                      # Cross-feature UI, config, errors and helpers
├── container.ts                 # Server composition root
└── proxy.ts

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

e2e/                            # Browser workflows with mocked external dependencies
```

## Request flow

```text
Client Component
      │ HTTP request
      ▼
src/app/api/*/route.ts
      │
      ▼
Feature Service ──► Feature Port ──► Feature Repository ──► Prisma / PostgreSQL
      │
      ▼
Feature Factory ──► Feature Domain output
```

Server Components and server-only code may call a service from `src/container.ts` directly. Client-side code must call `/api` through `src/shared/lib/http.ts`; it must not import services or Prisma.

## Layer ownership

| Location | Responsibility |
| --- | --- |
| `src/app` | Route-specific concerns, pages, layouts, route handlers, cookies, and HTTP responses. Keep it thin. |
| `src/shared/config/runtime.ts` | Shared application configuration. It exports the API base URL and server runtime configuration; application code consumes it instead of reading `process.env` directly. |
| `src/features/<feature>/components` | Reusable UI. Use Server Components by default; add a client boundary only for browser interaction or state. |
| `src/features/<feature>/domain` | Public application models and domain rules, including the `UserRole` authorization enum. It must not contain Prisma or UI concerns. |
| `src/features/<feature>/schema` | Zod validation schemas and inferred input types. |
| `src/shared/errors` | Application errors such as `AppError`. |
| `src/features/<feature>/ports` | Contracts that services require from persistence or external storage. |
| `src/features/<feature>/service` | Business logic, validation, authorization decisions, and orchestration. |
| `src/features/<feature>/repositories` | Prisma queries and external storage operations. Repositories return the values requested by their ports. |
| `src/features/<feature>/factories` | Maps Prisma records to public domain output, including Prisma role enum values to domain `UserRole`. Factories remove sensitive fields. |
| `src/container.ts` | Creates repository and service instances. |
| `src/shared/components` | Cross-feature UI and layouts. |
| `src/shared/lib` | Reusable technical helpers, Prisma global instance, API response formatting, validation parsing, and client HTTP setup. |
| `src/features/auth/lib` | Better Auth configuration, client, role checks, and authentication helpers. |
| `prisma/types` | Prisma-only types for records with included relations. These are not domain models. |

## Auth and session model

- Registration and login use `AuthService` and Better Auth. Request schemas validate input before calls reach the service.
- Better Auth owns sessions and cookies. `authCheck()` resolves the current user, and `requireAuth()` throws a 401 `AppError` when no valid session exists.
- Role checks use the authenticated user's `UserRole` and reject unauthorized access.
- `UserFactory.public()` is the boundary that returns only `id`, `name`, `email`, and `role`; passwords must never cross it.

## Persistence and local services

- Prisma client is initialised once in `src/shared/lib/prisma.ts` with a global instance.
- User roles are represented by the Prisma `Role` enum with `USER` and `ADMIN` values; there is no role table, service, or repository. The explicit initial-admin seed promotes one existing account, while Better Auth's Admin plugin handles later role and ban changes.
- The role-table-to-enum change uses `prisma db push --force-reset` because this project has no migration directory; resetting the development database removes existing data.
- `docker-compose.yml` runs PostgreSQL for local development.
- `.env` contains local values and is ignored. `.env.example` lists required variables only.

## Image storage

- `ImageService` owns generated keys and public domain output; `UploadImageSchema` and `DeleteImageSchema` validate route input before the service is called.
- `ImageRepository` is the core contract; `ImageRepositoryImpl` sends put/delete operations to Cloudflare R2 and builds the public object URL.
- `/api/images` accepts `POST` multipart form data with a `file` field and `DELETE` JSON with an object `key`. Both require an admin session.
- Uploads are limited to verified JPEG, PNG, or WebP content up to 5 MB and are stored under the `images/` namespace. The service returns `{ key, url }` so a future domain module can persist either value.
- R2 credentials remain server-only in `.env`. Configuration is resolved lazily, so missing R2 values do not fail build or tests; image requests return a safe configuration error instead.
