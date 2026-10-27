# Dashboard API

Read-only analytics for authenticated ADMIN users. This module does not create,
finish or exit games, calculate gameplay bonuses, schedule timeouts or change UI.

## Ownership and request flow

API route -> lib/dashboard.ts -> DashboardService -> DashboardRepository port
-> DashboardRepositoryImpl -> Prisma/PostgreSQL.

- Routes own HTTP input validation, authentication/role checks and shared responses.
- The library combines overview and paginated logs using one captured request time.
  It contains no Prisma query or statistic formula.
- DashboardService owns selected/today/comparison periods, formulas, comparisons,
  batch processing and public output. It has getOverview and getGames operations.
- DashboardRepositoryImpl owns database count/average/group/select queries and
  cursor pagination. It returns persistence records/aggregate results directly.
- DashboardFactory maps persistence records to public output; Prisma-specific
  selection/payload types stay in prisma/types/dashboard.ts.
- Pure statistical/date rules are in core/domain/dashboard-metrics.ts and
  core/domain/dashboard-period.ts. Container wiring constructs the service with
  the repository implementation. Existing unrelated services remain unchanged.

## Endpoints

| Method | Path | Response data |
| --- | --- | --- |
| GET | /api/dashboard | Overview KPI, charts and paginated game logs with round details |
| GET | /api/dashboard/games | Only paginated game logs with round details |

Both use successResponse/errorResponse. Successes have Cache-Control: private,
no-store. Missing authentication is 401, a non-admin is 403, invalid input is 400.

Examples:

```text
/api/dashboard
/api/dashboard?startDate=2026-10-01&endDate=2026-10-27
/api/dashboard/games?startDate=2026-10-01&endDate=2026-10-27&search=Player&page=2&pageSize=10
```

## Query parameters and dates

| Parameter | Contract |
| --- | --- |
| startDate/endDate | Optional paired YYYY-MM-DD inclusive dates, at most 366 calendar days |
| search | Optional trimmed case-insensitive game ID or username substring, max 100 characters; logs only |
| page | Integer 1-100000, default 1; logs only |
| pageSize | Integer 1-100, default 10; logs only |

Default: last **30 Asia/Bangkok calendar days including today**, rather than the
current calendar month. Date boundaries are Bangkok midnight through exclusive
midnight after endDate. Games belong to the selected period by Game.startedAt;
rounds attached to those games belong to the same cohort. Empty graph dates
are included with count zero.

**Exceptions to the selected filter:** the players card always measures today
(and compares with yesterday), currently playing users are not filtered by game
start date, and the drop-off reference uses every game in the database.

## Overview contract

- period: selected dates, immediately preceding period of equal length, timezone.
- generatedAt: captured request reference time. The response does not guarantee
  a single transactionally frozen snapshot across independent database reads.
- totalGames: count for all statuses in the selected period, previousCount for
  the immediately preceding equal-length period, and changePercent. Formula is
  (current - previous) / previous * 100; a zero baseline produces null.
- players: date, previousDate and timeZone explicitly identify today's Bangkok
  day and yesterday. count is distinct users with a game starting today;
  previousCount is yesterday's distinct users; changePercent compares those
  daily counts. playing is distinct users with any Game.status=PLAYING,
  including games started before today. It is persisted status, not heartbeat
  presence. Existing data cannot establish activity today for a game started
  yesterday without additional activity records; no activity tracking is added.
- roundAverage: average stored score of COMPLETED rounds on selected games,
  regardless of parent game status; count; maxScore=1000; percentage=score/1000*100;
  distanceMeters and distanceCount for completed rounds with non-null guesses.
  Pending rounds are excluded. Missing averages are null. Distances reuse the
  existing Haversine helper and current stored location coordinates.
- dropOff: selected-period INCOMPLETE count, ratePercent=INCOMPLETE/all games*100
  (zero for an empty period), plus the baseline/comparison below.
- dailyGames: ascending Bangkok date/count pairs, all statuses, including zeros.
- scores: final persisted totals for COMPLETED games with scores from 0 to 5000;
  maxScore=5000, sample count, weighted median and weighted mean, buckets,
  mostFrequentBucket and highAccuracy. No gameplay score is recomputed.
- games: the game-log response below.

### Drop-off baseline: all records, not three prior periods

The user changed the reference from three preceding periods to **all games in
the system**. baseline is:

```text
{
  scope: ALL_TIME,
  gameCount: all game records across all dates/statuses,
  incompleteCount: all INCOMPLETE game records,
  ratePercent: incompleteCount / gameCount * 100
}
```

This includes the selected period; it is not an earlier-only or three-period
baseline. Rate uses pooled game counts, not an unweighted average of daily
percentages. With no historical games, baseline.ratePercent is null.

comparison is above/below/equal/unavailable. differencePercentagePoints is the
selected rate minus the all-time rate, using rates rounded to two decimal
places. For example 4% vs 6% is below by 2 percentage points. An empty selected
period or unavailable baseline returns unavailable and a null difference. No
fixed 5% classification rule is applied.

byRound counts each incomplete game's first persisted PENDING round. Missing
pending-round records contribute to unknownRoundCount; the service does not
infer an exit round. mostCommonRound is null when unknown for all games. Ties
choose the earliest round.

### Score distribution and accuracy

Buckets: [0,1000), [1000,2000), [2000,3000), [3000,4000), [4000,5000), exactly
5000. Each includes min/max/maxInclusive/count/percentage. A perfect score is
counted once. Frequency ties choose the lowest range. Empty median, mean and
mostFrequentBucket are null; bucket percentages are zero.

highAccuracy is { threshold: 4000, operator: gt, count, percentage }. It counts
scores **strictly greater than 4000** in the selected completed-game sample;
4000 itself is excluded, 5000 is included. Its percentage is null with no scored
games. This score-based proportion differs from average geographic error and
from average round score / 1000. Invalid/null final totals are excluded from
this analysis, rather than converted to zero. Averages and percentages are
rounded to two decimals.

## Game logs

Response: items, total, page, pageSize, totalPages (at least 1, from the shared
getPagination helper). Ordering: startedAt DESC then id DESC. Search/pagination
never changes overview metrics.

Each item: id, user {id,name}, persisted status, startedAt/finishedAt ISO dates
(nullable finish), nullable persisted totalScore, roundScoreTotal, bonusScore,
and rounds sorted by question number. No email, token or auth record is selected.

roundScoreTotal sums completed rounds' stored scores. bonusScore remains null:
the schema has no separate bonus field and the dashboard does not invent a
bonus formula or known zero. Stored totals are preserved, not repaired/clamped.

Rounds: questionNumber, nullable status, location {id,name}, score,
distanceMeters, nullable playTimeSeconds. Pending results are null; a completed
round without a guess has null distance. No Prisma schema change is made.

## Performance and reuse

Counts, score averages/frequencies and daily counts are aggregated by the DB.
Daily SQL binds timezone and date parameters. Score frequency groups are bounded
to 5001 integer totals. Distance and incomplete-game records use batches of 500;
work still scales with history size, without loading all records into memory.
Full round details are selected only for the requested page of games.

Reuse: requireAuth, roleCheck, parseSchema, successResponse, errorResponse,
prisma, getPagination, haversineDistanceMeters, generated GameStatus/RoundStatus,
and shared dashboard date/score constants. UI mock maxScore=6000 and animation
durations are not scoring configuration. UI formatters remain on the client.

The exit API is separate state-changing work; see [game-api.md](game-api.md).
The dashboard reads its resulting INCOMPLETE status through existing queries.
The one-hour fallback discussed in the meeting remains unimplemented.

## Verification scope

- Domain unit tests: date defaults/boundaries, missing inputs, histogram/median/
  mean, high-accuracy boundaries and global baseline comparisons.
- Service unit tests use a mock repository: period policies, today's card,
  all-time baseline, batch completeness, pagination and unavailable values.
- Repository unit tests mock Prisma: date predicates, global queries, unique
  users, enum conditions, cursors, private projections and parameterized SQL.
- Factory unit tests verify mapping and exclusion of private/pending data.
- Library tests verify combined results with one request time and read failures.
- API tests verify role/validation/errors; API flow tests exercise the actual
  library, service, domain rules and factory with the repository port mocked.
- PostgreSQL execution, real persistence and browser E2E require infrastructure
  that was unavailable locally; mocked queries are not proof of real SQL.

## Main files

- src/lib/dashboard.ts
- src/core/service/dashboard.service.ts
- src/core/ports/dashboard.repository.ts
- src/infrastructure/repositories/dashboard.repository.ts
- src/infrastructure/factories/dashboard.factory.ts
- prisma/types/dashboard.ts
- src/core/domain/dashboard.ts
- src/core/domain/dashboard-metrics.ts (moved from lib)
- src/core/domain/dashboard-period.ts (moved from lib)
- src/core/constants/dashboard.ts
- src/core/schema/dashboard.schema.ts (same input contract)
- src/infrastructure/container.ts (dashboard wiring added)
- tests/unit/core/service/dashboard.service.test.ts
- tests/unit/infrastructure/repositories/dashboard.repository.test.ts
- tests/unit/dashboard.factory.test.ts
- tests/unit/core/domain/dashboard-metrics.test.ts (moved from unit/lib)
- tests/unit/core/domain/dashboard-period.test.ts (moved from unit/lib)
- tests/unit/lib/dashboard.test.ts (orchestration only; query cases now covered at the repository/service)
- tests/mocks/dashboard.repository.mock.ts
- tests/integration/api/dashboard-flow.test.ts
- tests/integration/api/dashboard.route.test.ts (existing authorization/validation contract)

## Verification for the layered implementation (2026-10-27)

- npm run test:unit: 49 files / 267 tests passed.
- npm run test:integration: 5 files / 42 tests passed, including the real
  route-library-service-factory flow with a mocked repository port.
- npm run lint: passed.
- npm run typecheck: passed.
- npm run build: passed, including both dashboard API routes. Existing Better
  Auth secret-strength warnings were emitted; credentials were not changed.
- npm run test:component: 222 passed / 5 failed across 49 files. Failures were
  in existing UI tests outside the dashboard changes: admin locations/users
  pagination accessible labels, Button color expectation, AuthLayout exact
  class-string expectation, and LobbyMenu countdown/session behavior. The
  users/locations tests mock the container and do not execute DashboardService.
  The LobbyMenu failure also reproduced when run alone. These UI tests/source
  were inspected but not changed to expand this backend task or weaken tests.
- Real PostgreSQL-backed integration and browser E2E were not run: Docker was
  unavailable. SQL predicates/serialization are tested with mocks; actual SQL
  execution and persisted behavior remain unverified. No Git command or schema/
  database mutation was used.
