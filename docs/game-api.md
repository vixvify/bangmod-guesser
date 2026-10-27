# Game exit API

## Contract

`POST /api/games/{id}/exit`

Requires an authenticated session. Both USER and ADMIN can exit only their own
game. The session supplies the user ID; request body fields cannot override
identity, score, status or timestamps. No body or Content-Type is required.
The path ID is trimmed, required and limited to 128 characters.

Frontend callers can use `GameRoutes.exit(id)` from
`src/routes/api/game.routes.ts`:

```ts
await fetch(GameRoutes.exit(gameId), {
  method: "POST",
  credentials: "include",
});
```

Success uses the existing response envelope and HTTP 200:

```json
{
  "data": {
    "id": "game-1",
    "status": "INCOMPLETE",
    "finishedAt": "2026-10-27T12:00:00.000Z"
  },
  "status": 200,
  "statusCode": "SUCCESS"
}
```

Successful responses have `Cache-Control: private, no-store`. `finishedAt` is
an ISO timestamp, or null when an existing terminal record has no finish time.
The response contains no user ID, private account data, guesses or scores.

| Existing game status | Result |
| --- | --- |
| PLAYING | Set INCOMPLETE and finishedAt to the server time |
| INCOMPLETE | Return the existing result and original finish time unchanged |
| COMPLETED | Return the existing result and original finish time unchanged |

The endpoint is idempotent: a retry does not reset the finish time. The frontend
must read the returned status; a completed game remains COMPLETED even if an exit
request arrives later. Scores, round statuses, answers and round times are not
changed. The dashboard will see INCOMPLETE through its existing database queries.

| HTTP status | Meaning |
| --- | --- |
| 400 | Invalid path ID |
| 401 | No authenticated session |
| 403 | The game belongs to another user, including for an ADMIN caller |
| 404 | Game not found, or the owned record disappeared before the update |
| 500 | Internal error; persistence details are hidden by errorResponse |

## Implementation

Route -> container GameService -> GameRepository -> GameRepositoryImpl -> Prisma.
The service checks existence and ownership before returning or changing a game.
GameFactory chooses public output fields. Prisma payload/select types stay in
`prisma/types/game.ts`; existing UI game result types are preserved.

The repository transaction uses updateMany with all three conditions: game ID,
owner ID and status=PLAYING. It then reads the stored owner-scoped record. The
write checks status again because completion or another exit may have occurred
after the service's first read. There is no unconditional status update or retry
that overwrites a terminal state.

Reused: requireAuth, parseSchema, AppError, successResponse, errorResponse,
config.apiUrl, the existing Prisma client and generated GameStatus enum.

No schema migration, dependency, scoring rule, frontend event hookup or automatic
one-hour timeout is introduced. This API performs an exit only when called.

Files added:

- src/app/api/games/[id]/exit/route.ts
- src/core/ports/game.repository.ts
- src/core/schema/game.schema.ts
- src/core/service/game.service.ts
- src/infrastructure/factories/game.factory.ts
- src/infrastructure/repositories/game.repository.ts
- src/routes/api/game.routes.ts
- prisma/types/game.ts
- tests/unit/core/service/game.service.test.ts
- tests/unit/core/schema/game.schema.test.ts
- tests/unit/infrastructure/repositories/game.repository.test.ts
- tests/unit/routes/game-api-routes.test.ts
- tests/integration/api/game-exit.route.test.ts
- tests/integration/repositories/game.repository.integration.test.ts
- docs/game-api.md

Files extended: src/core/domain/game.ts (exit response type),
src/infrastructure/container.ts (service wiring), docs/dashboard-api.md (exit
API reference). No UI component was extracted or modified.

## Tests

- Unit: GameService ownership/status/error handling, ID validation, repository
  query guards/transaction ordering and shared route URL construction.
- API integration: real route/service/factory with a mocked repository port;
  ordinary owner access, 401/403/404/400/500, spoofed body fields, retries and a
  completion that wins after the initial read.
- PostgreSQL integration: actual repository transactions, concurrent exits,
  stale reads, terminal-state preservation, ownership and unchanged scores/rounds.
  These tests are opt-in and never use the application's DATABASE_URL. They use
  only E2E_DATABASE_URL from e2e/config.ts and clean up their own test records.

Standard checks:

```text
npm run test:unit
npm run test:integration
npm run lint
npm run typecheck
npm run build
```

For the PostgreSQL integration tests, start the dedicated disposable E2E DB
using the project's existing e2e.compose.yml and apply migrations to that DB.
Then run in PowerShell:

```powershell
$env:RUN_GAME_DATABASE_TESTS = "1"
try {
  npx --no-install vitest run tests/integration/repositories/game.repository.integration.test.ts
} finally {
  Remove-Item Env:RUN_GAME_DATABASE_TESTS
}
```

Without that opt-in, the six real-PostgreSQL tests are reported as skipped.
Mocked tests do not verify actual PostgreSQL concurrency or persistence.
