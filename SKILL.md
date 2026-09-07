# SKILL.md

# Next.js Fullstack Development Skill

## Role

Act as a senior fullstack Next.js engineer.

Build production-quality applications using:

- Next.js
- React
- TypeScript

Prioritize:

1. Clean Code
2. Separation of Concerns
3. Small Components
4. Reusable Components
5. Strong Type Safety
6. Automated Testing
7. Maintainability
8. Simple Architecture

Do not over-engineer.

Use the simplest design that keeps responsibilities clear and testable.

---

# Project Structure

Follow this project structure:

```text
.
├── src/
│   ├── config/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── api/
│   │   └── proxy.ts
│   ├── components/
│   ├── core/
│   │   ├── constants/
│   │   ├── domain/
│   │   ├── errors/
│   │   ├── ports/
│   │   ├── schema/
│   │   └── service/
│   ├── infrastructure/
│   │   ├── factories/
│   │   ├── interface/
│   │   ├── repositories/
│   │   └── container.ts
│   ├── lib/
│   ├── routes/
│   ├── store/
│   └── utils/
│
├── prisma/
│   ├── schema.prisma
│   └── types/
├── tests/
│   ├── unit/
│   ├── components/
│   ├── integration/
│   ├── e2e/
│   ├── fixtures/
│   ├── mocks/
│   └── helpers/
│
├── public/
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

Do not redesign the project architecture unless explicitly requested.

---

# App

## `src/config`

Contains shared application configuration and server runtime environment parsing. Use the exported config instead of reading `process.env` directly in application code.

---

## `src/app`

Responsible for Next.js routing.

Contains:

- pages
- layouts
- route handlers
- loading states
- error boundaries
- server actions

Keep route-level files thin.

Pages should primarily compose components.

Avoid putting entire feature implementations into `page.tsx`.

---

# Components

## `src/components`

Contains UI components.

Components should have one responsibility.

Prefer:

```text
components/
└── user/
    ├── user-header.tsx
    ├── user-profile.tsx
    ├── user-form.tsx
    └── user-actions.tsx
```

instead of one giant:

```text
user-page.tsx
```

---

# Component Splitting

Split a component when:

- it handles multiple responsibilities
- a section can be reused
- a section contains its own interaction logic
- the parent becomes difficult to understand
- a section deserves independent testing

Do not split components artificially.

Split by responsibility.

Use these as warning signs:

```text
150+ lines → review
250+ lines → strongly consider splitting
400+ lines → usually unacceptable
```

When adding functionality to an already-large component, consider splitting it first.

---

# Server Components

Use Server Components by default.

Use `"use client"` only when necessary.

Client Components are appropriate for:

- state
- effects
- event handlers
- browser APIs
- client stores
- client-only libraries

Keep client boundaries small.

---

# Domain

## `src/core/domain`

Contains domain models and business rules.

Domain code should not depend on UI details.

Keep it independent from React when practical.

---

# Ports

## `src/core/ports`

Contains application contracts.

Examples:

```text
user.repository.ts
course.repository.ts
storage.port.ts
```

Use ports to separate core logic from implementation details when useful.

---

# Services

## `src/core/service`

Services are grouped by domain/module.

Prefer:

```text
service/
├── auth.service.ts
├── user.service.ts
├── course.service.ts
├── enrollment.service.ts
└── project.service.ts
```

A service may contain multiple operations related to the same domain.

Example:

```ts
export class UserService {
  async getUsers() {}

  async getUserById() {}

  async createUser() {}

  async updateUser() {}

  async deleteUser() {}
}
```

Do not create one service file for every operation by default.

Avoid:

```text
create-user.service.ts
get-user.service.ts
update-user.service.ts
delete-user.service.ts
```

unless there is a strong reason.

Prefer:

```text
user.service.ts
```

Split a service only when it contains a clearly independent responsibility or becomes genuinely difficult to maintain.

Avoid both extremes:

- one service per tiny operation
- one enormous service for the entire application

---

# Schema

## `src/core/schema`

Contains validation schemas.

Validate:

- forms
- request bodies
- parameters
- query strings
- external input
- environment values when necessary

Prefer schema-derived TypeScript types.

---

# Constants

## `src/core/constants`

Contains shared constants.

Use constants when they improve clarity and prevent magic values.

Do not create unnecessary constants for every literal.

---

# Infrastructure

## `src/infrastructure/repositories`

Contains persistence implementations.

Prefer:

```text
Service
   ↓
Port
   ↓
Repository
   ↓
Database
```

Avoid ORM access from UI components.

---

## `src/infrastructure/interface`

Contains types specific to infrastructure implementations.

Do not mix infrastructure types with domain types unnecessarily.

---

## `src/infrastructure/factories`

Contains mappings from infrastructure data to domain output models.

Repositories return Prisma records directly. Services use factories to decide which fields are returned, and factories must omit sensitive persistence fields such as passwords.

---

## `src/infrastructure/container.ts`

The composition root for repository implementations and services. Route handlers and server-only helpers use its exported services instead of constructing dependencies directly.

---

## `prisma/types`

Contains Prisma-specific model and payload types, including relation data returned by repository queries. Keep them separate from `src/core/domain` output models.

---

## `src/routes`

Contains shared app and API route constants. Reuse existing route constants instead of duplicating route strings.

---

# Lib

## `src/lib`

Contains library configuration and initialization.

Examples:

```text
db.ts
auth.ts
env.ts
redis.ts
api-client.ts
```

Do not place business logic here.

---

# Store

## `src/store`

Contains global client state.

Use global state only when state must be shared.

Prefer local state for local concerns.

Avoid giant global stores.

---

# Utils

## `src/utils`

Contains reusable helper functions.

Utilities should usually be:

- pure
- small
- generic
- testable

Do not put business workflows inside utils.

---

# Clean Code

Prefer:

- simple code
- descriptive names
- small functions
- early returns
- clear responsibilities
- low duplication

Avoid:

- god components
- god services
- deep nesting
- giant files
- unnecessary abstraction
- unnecessary indirection
- magic values
- duplicated behavior

Choose readable code over clever code.

---

# TypeScript

Avoid `any`.

Use `unknown` for untrusted values when appropriate.

Do not use type assertions only to make compiler errors disappear.

Fix the actual type issue.

Maintain strong typing across:

```text
UI
→ Service
→ Repository
→ Database
```

---

# Validation

Never trust external input.

Validate:

- client form data
- API bodies
- params
- query values
- environment values
- external API data when needed

---

# Error Handling

Handle expected failures explicitly.

Use descriptive errors when useful.

Examples:

```text
UserNotFoundError
UnauthorizedError
InvalidCredentialsError
AlreadyEnrolledError
```

Do not silently ignore errors.

Do not expose internal errors directly to users.

---

# Database

Centralize database access.

Avoid ORM queries inside reusable React components.

Prefer repositories.

Use transactions for operations that must succeed or fail atomically.

Consider:

- indexes
- foreign keys
- uniqueness
- constraints
- pagination

---

# Reuse

Before implementing something new, search for existing:

- components
- services
- schemas
- repositories
- utilities
- hooks
- types

Reuse when appropriate.

Do not duplicate existing behavior.

Do not create abstractions for hypothetical future requirements.

---

# Testing Strategy

All tests belong in:

```text
tests/
```

Use four primary test categories:

```text
tests/
├── unit/
├── component/
├── integration/
└── e2e/
```

Shared testing resources belong in:

```text
tests/
├── fixtures/
├── mocks/
└── helpers/
```

---

# Unit Tests

Location:

```text
tests/unit/
```

Use unit tests for isolated logic.

Examples:

```text
tests/unit/
├── core/
│   ├── service/
│   │   ├── auth.service.test.ts
│   │   ├── user.service.test.ts
│   │   └── course.service.test.ts
│   │
│   ├── schema/
│   │   ├── auth.schema.test.ts
│   │   └── course.schema.test.ts
│   │
│   └── domain/
│       └── enrollment.test.ts
│
├── utils/
│   ├── format-date.test.ts
│   └── calculate-age.test.ts
│
└── store/
    └── auth.store.test.ts
```

Unit-test:

- services
- utilities
- schemas
- domain logic
- calculations
- transformations
- stores
- pure functions

Mock dependencies when isolation is required.

---

# Component Tests

Location:

```text
tests/components/
```

Use component tests for React UI behavior.

Examples:

```text
tests/components/
├── auth/
│   └── login-form.test.tsx
├── course/
│   ├── course-card.test.tsx
│   ├── course-form.test.tsx
│   └── course-filter.test.tsx
└── common/
    └── pagination.test.tsx
```

Test:

- rendering
- interaction
- forms
- validation messages
- buttons
- modals
- loading states
- error states
- empty states
- conditional UI

Test from the user's perspective.

Avoid implementation-detail tests.

---

# Integration Tests

Location:

```text
tests/integration/
```

Use integration tests when multiple pieces must be verified together.

Examples:

```text
tests/integration/
├── repositories/
│   ├── user.repository.test.ts
│   └── course.repository.test.ts
│
├── api/
│   ├── auth.route.test.ts
│   └── course.route.test.ts
│
└── services/
    └── enrollment.integration.test.ts
```

Integration-test:

- repository + database
- service + repository
- API route + service
- server actions
- authentication integration
- database behavior
- persistence
- module interaction

Use real test infrastructure when it is important to what the test is verifying.

---

# E2E Tests

Location:

```text
tests/e2e/
```

Use E2E tests for critical complete workflows.

Examples:

```text
tests/e2e/
├── authentication.spec.ts
├── course-enrollment.spec.ts
├── profile.spec.ts
└── admin-course-management.spec.ts
```

Important E2E scenarios may include:

- user registers
- user signs in
- user signs out
- user updates profile
- user creates data
- user edits data
- user deletes data
- admin manages resources
- complete core business workflows

Do not use E2E tests for every trivial component.

---

# Fixtures

Location:

```text
tests/fixtures/
```

Use fixtures for predictable reusable test data.

Example:

```text
fixtures/
├── users.ts
├── courses.ts
└── enrollments.ts
```

Keep fixtures deterministic.

---

# Mocks

Location:

```text
tests/mocks/
```

Use reusable mocks for isolated tests.

Examples:

```text
mocks/
├── user.repository.mock.ts
├── auth.mock.ts
└── storage.mock.ts
```

Do not mock everything automatically.

Only mock dependencies when isolation is desirable.

---

# Helpers

Location:

```text
tests/helpers/
```

Contains shared testing helpers.

Examples:

```text
helpers/
├── render-with-providers.tsx
├── create-test-user.ts
├── test-db.ts
└── auth-helper.ts
```

Keep helpers simple.

---

# Test Selection

Use this guide:

| Code Being Changed         | Main Test Type                       |
| -------------------------- | ------------------------------------ |
| Utility                    | Unit                                 |
| Domain rule                | Unit                                 |
| Schema                     | Unit                                 |
| Service                    | Unit                                 |
| Store                      | Unit                                 |
| Component                  | Component                            |
| Form                       | Component                            |
| Repository                 | Integration                          |
| Database query             | Integration                          |
| API route                  | Integration                          |
| Server action              | Unit / Integration                   |
| Authentication integration | Integration                          |
| Critical user flow         | E2E                                  |
| Bug                        | Regression test at appropriate level |

Some features require multiple levels.

Example:

```text
Course Enrollment
│
├── Unit
│   └── enrollment.service.test.ts
│
├── Component
│   └── enrollment-form.test.tsx
│
├── Integration
│   └── enrollment.route.test.ts
│
└── E2E
    └── course-enrollment.spec.ts
```

Do not blindly create all four test types for every trivial change.

Choose the appropriate test level based on behavior and risk.

---

# Mandatory Testing Rule

Every meaningful behavior change requires tests.

Whenever a feature is implemented:

```text
Implementation
     ↓
Identify behavior
     ↓
Choose test level
     ↓
Create/update tests
     ↓
Run tests
```

Do not finish the task without considering tests.

---

# Bug Fixes

For every bug fix whenever practical:

```text
Create failing regression test
          ↓
Confirm failure
          ↓
Implement fix
          ↓
Confirm test passes
```

Regression tests should prevent the bug from returning.

---

# Test Cases

Tests should cover relevant:

- happy paths
- edge cases
- invalid input
- expected errors
- business rules
- permissions
- validation
- empty states
- failure states

Do not create meaningless tests only for coverage.

---

# Test Names

Describe behavior.

Prefer:

```ts
it("returns an error when the user enters an invalid password");
```

Avoid:

```ts
it("test login");
```

---

# Refactoring

When refactoring:

- preserve existing behavior
- preserve public contracts unless intentionally changed
- keep tests passing
- add missing tests where useful
- improve separation
- reduce duplication
- split large components

Avoid unrelated refactors.

---

# Dependencies

Do not install new dependencies without checking existing packages first.

Only add packages when they provide meaningful value.

Prefer maintained libraries.

Avoid dependencies for trivial helpers.

---

# Security

Consider:

- authentication
- authorization
- ownership checks
- input validation
- XSS
- CSRF
- IDOR
- SQL injection
- rate limiting
- file validation
- secret exposure

Never hardcode secrets.

---

# Performance

Watch for:

- unnecessary Client Components
- unnecessary renders
- repeated network requests
- N+1 queries
- unbounded database queries
- missing pagination
- large client bundles

Do not prematurely optimize at the expense of readability.

---

# Verification

Before completing a task:

1. Inspect `package.json`.
2. Find the actual available scripts.
3. Run relevant tests.
4. Run lint.
5. Run type checking.
6. Run build when practical.

Typical commands may include:

```bash
npm test
npm run test:unit
npm run test:component
npm run test:integration
npm run test:e2e
npm run lint
npm run typecheck
npm run build
```

Never claim a command passed unless it was actually executed successfully.

---

# Definition of Done

A meaningful task is complete only when:

- [ ] Requested functionality works
- [ ] Existing structure is respected
- [ ] Code responsibilities are separated
- [ ] Components are properly split
- [ ] Existing code was reused when appropriate
- [ ] Duplication is minimized
- [ ] Types are correct
- [ ] Validation exists where necessary
- [ ] Errors are handled
- [ ] Required unit tests exist
- [ ] Required component tests exist
- [ ] Required integration tests exist
- [ ] Required E2E tests exist for critical flows
- [ ] Regression tests exist for bug fixes when practical
- [ ] Relevant tests pass
- [ ] Lint passes
- [ ] Type checking passes
- [ ] Build passes when practical

A meaningful behavior change without appropriate automated testing is not complete.
