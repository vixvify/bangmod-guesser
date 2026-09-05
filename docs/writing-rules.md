# Writing Rules

## Place code in the owning layer

- Add a page, layout, loading state, not-found page, or route handler in `src/app`.
- Add reusable presentation in `src/components`; do not place a whole feature UI in `page.tsx` when it has independently meaningful sections.
- Add business decisions to a service in `src/core/service`.
- Add request, form, param, and query validation to a Zod schema in `src/core/schema`; derive input types from that schema.
- Add Prisma access only to `src/infrastructure/repositories`.
- Add transformations from Prisma records to API/domain output to `src/infrastructure/factories` and call them from services, never repositories.
- Add framework-independent helpers to `src/utils`; add technical integrations and setup to `src/lib`.

## Naming and file conventions

- Use **kebab-case** for non-framework filenames: `auth.service.ts`, `auth.repository.ts`, `user.factory.ts`, `user-card.tsx`, and `role-check.ts`.
- Name layer files with their responsibility suffix: `.service.ts`, `.repository.ts`, `.factory.ts`, `.schema.ts`, `.error.ts`, `.constant.ts`, and `.routes.ts`.
- Preserve required Next.js filenames exactly: `page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx`, `route.ts`, and `proxy.ts`.
- Use **PascalCase** for React components, classes, interfaces, types, schemas, and factories: `UserCard`, `AuthService`, `AuthRepository`, `RegisterInput`, `RegisterSchema`, and `UserFactory`.
- Use **camelCase** for variables, functions, object properties, service instances, and hooks: `authService`, `findByEmail`, `parseSchema`, and `createUserModel`.
- Start boolean names with `is`, `has`, `can`, `should`, or `needs`: `isAuthenticated`, `hasPermission`, and `shouldRedirect`.
- Use **UPPER_SNAKE_CASE** only for exported constants that represent fixed shared values: `AUTH_MESSAGES` and `SESSION_DURATION_SECONDS`.
- Name a test after the file or feature it verifies: `auth.service.test.ts` and `auth.route.test.ts`. Mirror the source layer under `tests/` where practical.

## TypeScript and import conventions

- Use explicit types for exported functions, public class methods, and values where inference does not make the contract obvious.
- Use `type` imports for type-only dependencies: `import type { User } from "@/core/domain/user"`.
- Do not use `any`, `as any`, or broad assertions to bypass a type error. Use `unknown`, a schema, a type guard, or correct the underlying contract.
- Prefer schema-derived input types such as `RegisterInput`; do not duplicate an inferable input type manually.
- Use the `@/` alias for imports from `src` outside the current local module area. Use relative imports for closely related files in the same module.
- Keep imports grouped as external packages, type imports, and internal modules; remove unused imports before finishing.

## Code style

- Keep functions focused and prefer early returns over deeply nested conditions.
- Use descriptive names that reveal intent. Avoid placeholders such as `data`, `value`, `thing`, `temp`, or `handleStuff` when a domain-specific name is available.
- Keep public functions small enough that their responsibility is clear. Extract a helper only when it represents a meaningful reusable operation.
- Follow the repository's ESLint rules and existing formatting. Run `npm run lint` and `npm run typecheck` after TypeScript changes.

## API and server rules

- Keep `route.ts` thin: read input, call a service, set route-specific cookies or headers, and return `successResponse` or `errorResponse`.
- Do not implement business logic, Prisma queries, validation rules, or reusable response formatting in route handlers.
- Use `parseSchema()` for external input. Do not manually normalize fields that the schema already normalizes.
- Throw `AppError` for expected application failures. Let `errorResponse()` convert it into the shared error response shape.
- Use `authCheck()` for a valid authenticated user. Use `roleCheck(user, roles)` for protected roles.
- Do not expose passwords, session tokens, database errors, stack traces, or other persistence-only fields in API output.

## Persistence and type rules

- Repositories return the Prisma data required by the port; do not use factories in repositories.
- Keep Prisma relation payload types in `prisma/types`. Keep public output models in `src/core/domain`.
- Services own password hashing, credential verification, duplicate checks, and factory selection.
- Use the container for service instances. Do not create repositories or services ad hoc in route handlers.
- Add database constraints and indexes in `prisma/schema.prisma`; seed static reference data instead of creating unnecessary services for it.

## Frontend rules

- Prefer Server Components. Use `"use client"` only for state, effects, event handlers, browser APIs, or client-only libraries.
- Client code uses the `/api` boundary through `src/lib/http.ts`; it never imports server-only code, services, repositories, or Prisma.
- Reuse route constants from `src/routes` rather than duplicating shared route strings.
- Keep global state focused in `src/store`; prefer local state when it does not need to be shared.

## Test rules

- Put tests only under `tests/`: `unit`, `components`, `integration`, or `e2e` when a browser workflow is introduced.
- Unit tests mock ports and verify services, schemas, factories, and utilities in isolation.
- Integration tests call route handlers with mocked services and verify HTTP responses, cookies, and error mapping without a database.
- Add E2E tests only when a critical browser workflow exists and its required infrastructure is available.
- Use `tests/fixtures` for deterministic data, `tests/mocks` for reusable mocks, and `tests/helpers` for shared setup.
- Run the relevant test script plus lint, typecheck, and build before considering a change complete.
