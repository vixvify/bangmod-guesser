# API Reference

Full reference for all HTTP endpoints in this Next.js application.

---

## Conventions

### Base URL

All paths are relative to the application root (e.g. `http://localhost:3000`).

### Authentication

Every route uses `secureRoute()`, which enforces three things before the handler runs:

1. **Origin check** — Non-GET/HEAD/OPTIONS requests must originate from the same site (CSRF guard).
2. **Rate limiting** — Applied per IP address and, for authenticated routes, also per user ID.
3. **Session check** — Based on the route's access level.

| Access Level | Behavior |
|---|---|
| `public` | No session required. |
| `authenticated` | Requires a valid session cookie. Returns `401` if missing. |
| `admin` | Requires a session where `role = ADMIN`. Returns `403` for non-admins. |

Sessions use **HTTP-only cookies** managed by Better Auth.

### Rate Limit Groups

| Group | Limit | Behavior on excess |
|---|---|---|
| `auth` | 10 req/min | Closed (all requests blocked until window resets) |
| `authRead` | 120 req/min | Closed |
| `mutation` | 60 req/min | Closed |
| `admin` | 60 req/min | Closed |
| `read` | 120 req/min | Open |

When rate-limited, the response is `429` with a `Retry-After` header (seconds).

### Response Envelope

All responses share a common envelope.

**Success:**
```json
{
  "data": <payload>,
  "status": 200,
  "statusCode": "SUCCESS"
}
```

**Created:**
```json
{
  "data": <payload>,
  "status": 201,
  "statusCode": "CREATED"
}
```

**Error:**
```json
{
  "error": "Human-readable message",
  "status": 409,
  "statusCode": "ERROR"
}
```

Some errors carry a machine-readable code string in `statusCode`, such as `GAME_ENDED`, `STALE_UPDATE`, or `IMAGE_IN_USE`.

---

## Session / Auth

### POST `/api/session/register`

Create a new user account.

**Auth:** Public | **Rate limit:** `auth`

**Request body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

| Field | Rules |
|---|---|
| `name` | 2–50 chars, whitespace-trimmed |
| `email` | Valid email address, lowercased |
| `password` | 8–72 chars, requires at least one uppercase letter, one lowercase letter, and one digit |
| `confirmPassword` | Must match `password` |

**Response:** `201 Created`
```json
{ "data": null, "status": 201, "statusCode": "CREATED" }
```

**Errors:**

| Status | Reason |
|---|---|
| `400` | Validation failure |
| `409` | Email already registered |
| `429` | Rate limit exceeded |

---

### POST `/api/session/login`

Sign in with email and password. Sets a session cookie on success.

**Auth:** Public | **Rate limit:** `auth`

**Request body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{ "data": null, "status": 200, "statusCode": "SUCCESS" }
```

A `Set-Cookie` header is included with the session cookie.

**Errors:**

| Status | Reason |
|---|---|
| `400` | Missing or invalid fields |
| `401` | Wrong credentials |
| `429` | Rate limit exceeded |

---

### POST `/api/session/logout`

Invalidate the current session and clear the session cookie. If the authenticated user has an active game in `PLAYING` status, it is automatically terminated and marked `INCOMPLETE` before the session is destroyed.

**Auth:** Public | **Rate limit:** `auth`

**Request body:** None

**Response:** `200 OK`
```json
{ "data": null, "status": 200, "statusCode": "SUCCESS" }
```

---

### POST `/api/session/google`

Initiate Google OAuth sign-in. Returns the authorization URL to redirect the browser to.

**Auth:** Public | **Rate limit:** `auth`

**Request body:**
```json
{
  "callbackURL": "string",
  "errorCallbackURL": "string"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "url": "https://accounts.google.com/o/oauth2/..."
  }
}
```

**Errors:**

| Status | Reason |
|---|---|
| `400` | Google OAuth configuration error |
| `429` | Rate limit exceeded |

---

### POST `/api/session/forgot-password`

Send a password-reset email to the given address.

**Auth:** Public | **Rate limit:** `auth`

**Request body:**
```json
{ "email": "string" }
```

**Response:** `200 OK`
```json
{ "data": null, "status": 200, "statusCode": "SUCCESS" }
```

Always returns `200` regardless of whether the email is registered (prevents email enumeration).

---

### POST `/api/session/reset-password`

Set a new password using the token from a reset email.

**Auth:** Public | **Rate limit:** `auth`

**Request body:**
```json
{
  "token": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

| Field | Rules |
|---|---|
| `token` | Non-empty string from the reset email link |
| `password` | Same rules as registration |
| `confirmPassword` | Must match `password` |

**Response:** `200 OK`
```json
{ "data": null, "status": 200, "statusCode": "SUCCESS" }
```

**Errors:**

| Status | Reason |
|---|---|
| `400` | Token invalid or expired, password rules violated, or passwords do not match |

---

### GET / POST `/api/auth/[...all]`

Better Auth catch-all handler. Manages OAuth callbacks, session tokens, and Better Auth internals.

**Auth:** Public | **Rate limit:** `authRead` (GET), `auth` (POST)

This endpoint is called by Better Auth's browser-side client and OAuth providers, not directly by application UI code.

---

## Game

All game routes require authentication. All responses include `Cache-Control: private, no-store`.

### POST `/api/games`

Create a new game, or resume the existing active game.

**Auth:** Authenticated | **Rate limit:** `mutation`

**Request body** (optional — can be an empty object):
```json
{
  "replaceGameId": "string"
}
```

| Field | Rules |
|---|---|
| `replaceGameId` | Optional. When provided, abandons that game (marks INCOMPLETE) and starts a fresh one. |

If an active (`PLAYING`) game already exists and `replaceGameId` is not given, that game is returned with `existing: true` and HTTP `200`.

Otherwise, the server randomly selects 5 distinct ACTIVE locations that each have at least one image, assigns a random `imageNumber` per round, and creates the `Game` with all 5 `GameRound` rows in a single transaction.

**Response:** `201 Created` (new game) or `200 OK` (resumed)
```json
{
  "data": {
    "gameId": "string",
    "existing": false
  }
}
```

**Errors:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |
| `409` | Fewer than 5 active locations with images available |

---

### GET `/api/games/active`

Check whether the authenticated user currently has a game in progress (`PLAYING`).

**Auth:** Authenticated | **Rate limit:** `read`

**Request body:** None

**Response:** `200 OK`
```json
{
  "data": {
    "activeGameId": "string"
  },
  "status": 200,
  "statusCode": "SUCCESS"
}
```

If no active game exists, `activeGameId` is `null`.

**Errors:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |

---

### GET `/api/games/{id}/current-round`

Get the image URL and metadata for the current pending round.

**Auth:** Authenticated | **Rate limit:** `read`

**Path params:** `id` — game ID

The first call for a round records `startedAt` and starts the 40-second timer. Subsequent calls for the same unanswered round return the same deadline; calling after a round is answered returns the next round.

The response does **not** include the actual location, coordinates, or answer.

**Response:** `200 OK`
```json
{
  "data": {
    "questionNumber": 2,
    "imageUrl": "https://cdn.example.com/images/abc.webp",
    "deadlineAt": "2026-11-10T01:00:40.000Z"
  }
}
```

| Field | Description |
|---|---|
| `questionNumber` | Current round number (1–5), determined by the server |
| `imageUrl` | Image to display for this round |
| `deadlineAt` | `startedAt + 40 s` in ISO 8601 UTC; `null` if the round hasn't been opened yet |

**Errors:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |
| `403` | Game belongs to another user |
| `404` | Game not found |
| `409` | Game is not PLAYING, or no image for the round. `statusCode: "GAME_ENDED"` when the game is INCOMPLETE |

---

### POST `/api/games/{id}/current-round`

Explicitly open a round by number, starting its timer. Used to avoid race conditions when the client already knows the round number.

**Auth:** Authenticated | **Rate limit:** `mutation`

**Path params:** `id` — game ID

**Request body:**
```json
{ "questionNumber": 2 }
```

**Response:** `200 OK` — same shape as GET `/api/games/{id}/current-round`

**Errors:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |
| `403` | Not the game owner |
| `404` | Game not found |
| `409` | Requested `questionNumber` does not match the current pending round |

---

### POST `/api/games/{id}/rounds/{questionNumber}/guess`

Submit a guess for a round, or record a timed-out round (send `null` coordinates after the deadline).

**Auth:** Authenticated | **Rate limit:** `mutation`

**Path params:**
- `id` — game ID
- `questionNumber` — integer 1–5

**Request body:**
```json
{
  "guessedLatitude": 13.65,
  "guessedLongitude": 100.49
}
```

Both fields must be `null` or both must be non-null. Send `null, null` only after the deadline to record a timed-out round; sending `null` before the deadline returns `409`.

The server calculates distance using the Haversine formula and scores using:
```
score(d) = round(1000 × exp(ln(0.7) × (max(0, d) / 25)^2.1739))
```

A time bonus is added only on the final round (round 5):
```
bonus(t) = round(300 × max(0, min(1, (200 - t) / 190)))
```

Total score is capped at `5000`.

**Response:** `200 OK`
```json
{
  "data": {
    "guessedLatitude": 13.65,
    "guessedLongitude": 100.49,
    "distanceMeters": 15.5,
    "timedOut": false,
    "score": 881,
    "accumulatedScore": 1681,
    "imageUrl": "https://cdn.example.com/images/abc.webp",
    "location": {
      "latitude": 13.6501,
      "longitude": 100.4901,
      "name": "Location Name",
      "description": "Optional description or null"
    }
  }
}
```

| Field | Description |
|---|---|
| `distanceMeters` | Haversine distance in metres; `null` if timed out |
| `timedOut` | `true` when the server recorded the round as a timeout |
| `guessedLatitude/Longitude` | The coordinates actually recorded; `null` on timeout |
| `score` | Points for this round |
| `accumulatedScore` | Total points from round 1 through this round |
| `imageUrl` | The round's image URL (use for the info button after reveal) |
| `location` | Actual location coordinates and details for the answer reveal |

**Errors:**

| Status | Reason |
|---|---|
| `400` | Invalid coordinates or round number |
| `401` | Not authenticated |
| `403` | Not the game owner |
| `404` | Game not found |
| `409` | Round already answered, round not yet opened, game not PLAYING, previous rounds incomplete, or `null` coordinates sent before the deadline |

---

### GET `/api/games/{id}/rounds/{questionNumber}/result`

Retrieve the saved result of an already-answered round. Read-only; safe to call multiple times.

**Auth:** Authenticated | **Rate limit:** `read`

**Path params:**
- `id` — game ID
- `questionNumber` — integer 1–5

**Response:** `200 OK` — same shape as the guess endpoint response.

**Errors:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |
| `403` | Not the game owner |
| `404` | Game or round not found |
| `409` | Round has not been answered yet |

---

### GET `/api/games/{id}/summary`

Get the final score breakdown for a completed game.

**Auth:** Authenticated | **Rate limit:** `read`

**Path params:** `id` — game ID

**Response:** `200 OK`
```json
{
  "data": {
    "baseScore": 4000,
    "totalTimeSeconds": 120,
    "bonusScore": 126,
    "totalScore": 4126
  }
}
```

| Field | Description |
|---|---|
| `baseScore` | Sum of all 5 round scores |
| `totalTimeSeconds` | Total play time across all rounds |
| `bonusScore` | Time bonus (may exceed what was actually added when score was capped at 5000) |
| `totalScore` | `min(5000, baseScore + bonusScore)` — the recorded final score |

**Errors:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |
| `403` | Not the game owner |
| `404` | Game not found |
| `409` | Game is not COMPLETED or not all 5 rounds have complete answers |

---

### POST `/api/games/{id}/exit`

Exit an in-progress game. Marks it INCOMPLETE if it was PLAYING.

**Auth:** Authenticated | **Rate limit:** `mutation`

**Path params:** `id` — game ID

**Request body:** None

**Response:** `200 OK`
```json
{
  "data": {
    "id": "string",
    "status": "INCOMPLETE",
    "finishedAt": "2026-11-10T01:05:00.000Z"
  }
}
```

If the game is already COMPLETED or INCOMPLETE, its current state is returned without modification.

**Errors:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |
| `403` | Not the game owner |
| `404` | Game not found |

---

### POST `/api/games/{id}/terminate`

Terminate an in-progress game without requiring an active session. Marks it `INCOMPLETE` if it was `PLAYING`.

**Auth:** Public | **Rate limit:** `mutation`

**Path params:** `id` — game ID

**Request body:** None

**Response:** `200 OK`
```json
{
  "data": {
    "id": "string",
    "status": "INCOMPLETE",
    "finishedAt": "2026-11-10T01:05:00.000Z"
  },
  "status": 200,
  "statusCode": "SUCCESS"
}
```

If the game is already `COMPLETED` or `INCOMPLETE`, its current state is returned without modification. This endpoint is designed for unauthenticated recovery when a session has expired or was terminated from another tab.

**Errors:**

| Status | Reason |
|---|---|
| `400` | Invalid game ID |
| `404` | Game not found |

---

## Profile

### GET `/api/profile`

Get the current user's profile and game history.

**Auth:** Authenticated | **Rate limit:** `read`

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `from` | `YYYY-MM-DD` | — | Filter games from this date (Bangkok timezone) |
| `to` | `YYYY-MM-DD` | — | Filter games up to and including this date |
| `page` | integer ≥ 1 | `1` | Page number (4 games per page) |

`from` must not be after `to` when both are provided.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "games": [
      {
        "id": "string",
        "status": "COMPLETED",
        "totalScore": 4126,
        "grade": "S",
        "playedAt": "2026-11-10T01:05:00.000Z",
        "bestDistanceMeters": 12.5,
        "bestRoundScore": 950,
        "bestRoundNumber": 3
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 4,
      "totalGames": 42,
      "totalPages": 11
    }
  }
}
```

| Field | Description |
|---|---|
| `grade` | `SSS \| S \| A \| B \| C \| D \| null` — grade based on total score |
| `bestDistanceMeters` | Closest guess across all rounds in that game |
| `bestRoundScore` | Highest single-round score in that game |
| `bestRoundNumber` | Which round produced the best score |

**Errors:**

| Status | Reason |
|---|---|
| `400` | Invalid query params (`from` after `to`, bad date format) |
| `401` | Not authenticated |
| `404` | User not found |

---

### PATCH `/api/profile`

Update the current user's display name.

**Auth:** Authenticated | **Rate limit:** `mutation`

**Request body:**
```json
{ "username": "string" }
```

| Field | Rules |
|---|---|
| `username` | 2–50 chars, whitespace-trimmed |

**Response:** `200 OK`
```json
{ "data": { "username": "NewName" }, "status": 200, "statusCode": "SUCCESS" }
```

**Errors:**

| Status | Reason |
|---|---|
| `400` | Username fails validation |
| `401` | Not authenticated |

---

## Leaderboard

### GET `/api/leaderboard`

Get the global leaderboard and the current user's rank.

**Auth:** Authenticated | **Rate limit:** `read`

**Query params:** None

**Response:** `200 OK`
```json
{
  "data": {
    "entries": [
      {
        "rank": 1,
        "name": "string",
        "image": "string | null",
        "gamesPlayed": 10,
        "totalScore": 49800
      }
    ],
    "myRank": {
      "rank": 42,
      "name": "string",
      "image": "string | null",
      "gamesPlayed": 5,
      "totalScore": 20000
    }
  }
}
```

`myRank` is `null` if the current user has not completed any games.

**Errors:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |

---

## Locations (Admin)

All location routes require `access: "admin"`. Non-admins receive `403`.

### GET `/api/locations`

List locations with optional filtering and pagination.

**Auth:** Admin | **Rate limit:** `admin`

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `search` | string | — | Search term |
| `searchBy` | `"name" \| "description"` | `"name"` | Field to search |
| `page` | integer ≥ 1 | `1` | Page number |
| `pageSize` | integer 1–100 | `10` | Results per page |
| `orderBy` | `"asc" \| "desc"` | `"desc"` | Sort order |

**Response:** `200 OK`
```json
{
  "data": {
    "items": [
      {
        "id": "string",
        "name": "string",
        "description": "string | null",
        "latitude": 13.6501,
        "longitude": 100.4901,
        "status": "ACTIVE",
        "images": [{ "imageNumber": 1, "url": "https://..." }],
        "createdAt": "2026-10-01T00:00:00.000Z",
        "updatedAt": "2026-10-02T00:00:00.000Z"
      }
    ],
    "page": 1,
    "pageSize": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### POST `/api/locations`

Create a new location with one or more images.

**Auth:** Admin | **Rate limit:** `admin`

**Content-Type:** `multipart/form-data`

**Form fields:**

| Field | Type | Rules |
|---|---|---|
| `name` | string | 1–100 chars |
| `description` | string | Optional, max 500 chars |
| `latitude` | numeric string | −90 to 90 |
| `longitude` | numeric string | −180 to 180 |
| `images` | File (1–5) | JPEG/PNG/WebP, max 5 MB each |

**Response:** `201 Created` — single location object (same shape as an item in the list response).

**Errors:**

| Status | Reason |
|---|---|
| `400` | Missing required fields, invalid coordinates, too many images, file too large, unsupported image type, or file content doesn't match the declared type |
| `403` | Not admin |

---

### GET `/api/locations/{id}`

Get a single location by ID.

**Auth:** Admin | **Rate limit:** `admin`

**Path params:** `id` — location ID

**Response:** `200 OK` — single location object

**Errors:**

| Status | Reason |
|---|---|
| `403` | Not admin |
| `404` | Location not found |

---

### PUT `/api/locations/{id}`

Update a location's metadata and/or images.

**Auth:** Admin | **Rate limit:** `admin`

Accepts two content types.

**Option A — JSON** (`Content-Type: application/json`):
```json
{
  "name": "string",
  "description": "string",
  "latitude": 13.6501,
  "longitude": 100.4901,
  "status": "ACTIVE",
  "keepImageNumbers": [1, 3],
  "newImages": [],
  "expectedImages": [{ "imageNumber": 1, "imageUrl": "https://..." }]
}
```

**Option B — Multipart form** (`Content-Type: multipart/form-data`):

| Field | Type | Description |
|---|---|---|
| `name` | string | Optional |
| `description` | string | Optional |
| `latitude` | string | Optional |
| `longitude` | string | Optional |
| `status` | string | Optional |
| `keepImageNumbers` | repeated string | Image numbers to retain |
| `newImages` | File[] | New image files to add |
| `expectedImages` | JSON string | Current images for optimistic concurrency check |

`expectedImages` enables optimistic concurrency: if the actual images differ from what the client last loaded, the server returns `409 STALE_UPDATE`.

**Response:** `200 OK` — updated location object

**Errors:**

| Status | Code | Reason |
|---|---|---|
| `400` | — | Validation errors, final image count outside 1–5, or duplicate image numbers |
| `403` | — | Not admin |
| `404` | — | Location or image not found |
| `409` | `STALE_UPDATE` | Images were modified by another request since last load |
| `409` | `IMAGE_IN_USE` | An image being removed is currently assigned to an active game round |

---

### DELETE `/api/locations/{id}`

Delete a location and all its images from storage.

**Auth:** Admin | **Rate limit:** `admin`

**Path params:** `id` — location ID

**Response:** `200 OK`
```json
{ "data": null, "status": 200, "statusCode": "SUCCESS" }
```

**Errors:**

| Status | Reason |
|---|---|
| `403` | Not admin |
| `404` | Location not found |

---

### DELETE `/api/locations/{id}/images/{imageNumber}`

Delete a single image from a location.

**Auth:** Admin | **Rate limit:** `admin`

**Path params:**
- `id` — location ID
- `imageNumber` — integer 1–5

**Response:** `200 OK` — updated location object (after the image is removed)

**Errors:**

| Status | Code | Reason |
|---|---|---|
| `403` | — | Not admin |
| `404` | — | Location or image not found |
| `409` | `IMAGE_IN_USE` | Image is assigned to an active game round |

---

## Users (Admin)

### GET `/api/users`

List all users with optional filtering and pagination.

**Auth:** Admin | **Rate limit:** `admin`

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer ≥ 1 | `1` | Page number |
| `limit` | integer 1–100 | `9` | Results per page |
| `role` | `"USER" \| "ADMIN"` | — | Filter by role |
| `status` | `"ACTIVE" \| "SUSPENDED" \| "INACTIVE"` | — | Filter by status |

**Response:** `200 OK`
```json
{
  "data": {
    "users": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "image": "string | null",
        "role": "USER",
        "status": "ACTIVE",
        "gameCount": 5,
        "suspension": {
          "startDate": "2026-01-01",
          "endDate": "2026-02-01"
        },
        "reason": "string"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 9
  }
}
```

**Errors:**

| Status | Reason |
|---|---|
| `403` | Not admin |

---

### PATCH `/api/users/{id}`

Update a user's name, role, and/or suspension status.

**Auth:** Admin | **Rate limit:** `admin`

**Path params:** `id` — user ID

**Request body:**
```json
{
  "name": "string",
  "role": "USER",
  "status": "SUSPENDED",
  "suspension": {
    "startDate": "2026-01-01",
    "endDate": "2026-02-01"
  },
  "reason": "string"
}
```

| Field | Rules |
|---|---|
| `name` | 2–50 chars |
| `role` | `USER` or `ADMIN` |
| `status` | `ACTIVE`, `SUSPENDED`, or `INACTIVE` |
| `suspension.endDate` | Must be a future date when `status` is `SUSPENDED` |
| `reason` | Max 200 chars |

**Response:** `200 OK` — updated user object (same shape as a user in the list response)

**Errors:**

| Status | Reason |
|---|---|
| `400` | End date is not in the future |
| `403` | Not admin |
| `404` | User not found |

---

### DELETE `/api/users/{id}`

Permanently delete a user account.

**Auth:** Admin | **Rate limit:** `admin`

**Path params:** `id` — user ID

**Response:** `200 OK`
```json
{
  "data": { "success": true, "userId": "string" },
  "status": 200,
  "statusCode": "SUCCESS"
}
```

**Errors:**

| Status | Reason |
|---|---|
| `403` | Not admin |
| `404` | User not found |

---

## Dashboard (Admin)

### GET `/api/dashboard`

Fetch the full analytics dashboard: metrics overview plus paginated game logs.

**Auth:** Admin | **Rate limit:** `admin`

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `startDate` | `YYYY-MM-DD` | — | Period start. Must be paired with `endDate`. |
| `endDate` | `YYYY-MM-DD` | — | Period end. Range must be 1–90 days. |
| `search` | string (max 100) | `""` | Search term for game logs |
| `page` | integer 1–100000 | `1` | Page number for game logs |
| `pageSize` | integer 1–100 | `10` | Page size for game logs |

Both `startDate` and `endDate` must be provided together.

**Response:** `200 OK`

Top-level fields:

| Field | Description |
|---|---|
| `period` | `{ startDate, endDate, previousStartDate, previousEndDate, timeZone }` |
| `generatedAt` | ISO 8601 timestamp of when the report was generated |
| `totalGames` | `{ count, previousCount, changePercent }` — games in the period vs. the equivalent prior period |
| `players` | `{ date, previousDate, timeZone, count, previousCount, changePercent, playing }` — unique active players |
| `roundAverage` | `{ score, maxScore, percentage, count, distanceMeters, distanceCount }` — average per round |
| `dropOff` | Incomplete-game analysis: rate, comparison to all-time baseline, most common dropout round, breakdown by round |
| `dailyGames` | `[{ date, count }]` — daily game counts within the period |
| `scores` | Distribution stats: `median`, `mean`, `highAccuracy` count, `buckets`, `mostFrequentBucket` |
| `games` | Paginated game logs (see `/api/dashboard/games` below) |

---

### GET `/api/dashboard/games`

Get paginated game logs only. Accepts the same query params as `/api/dashboard`.

**Auth:** Admin | **Rate limit:** `admin`

**Response:** `200 OK`
```json
{
  "data": {
    "items": [
      {
        "id": "string",
        "user": { "id": "string", "name": "string" },
        "status": "COMPLETED",
        "startedAt": "2026-11-10T01:00:00.000Z",
        "finishedAt": "2026-11-10T01:05:00.000Z",
        "totalScore": 4126,
        "roundScoreTotal": 4000,
        "bonusScore": 126,
        "rounds": [
          {
            "questionNumber": 1,
            "status": "COMPLETED",
            "location": { "id": "string", "name": "string" },
            "score": 950,
            "distanceMeters": 12.5,
            "playTimeSeconds": 18
          }
        ]
      }
    ],
    "total": 200,
    "page": 1,
    "pageSize": 10,
    "totalPages": 20
  }
}
```

**Errors:**

| Status | Reason |
|---|---|
| `403` | Not admin |

---

## Summary Table

| Method | Path | Auth | Rate Limit |
|---|---|---|---|
| `POST` | `/api/session/register` | Public | `auth` |
| `POST` | `/api/session/login` | Public | `auth` |
| `POST` | `/api/session/logout` | Public | `auth` |
| `POST` | `/api/session/google` | Public | `auth` |
| `POST` | `/api/session/forgot-password` | Public | `auth` |
| `POST` | `/api/session/reset-password` | Public | `auth` |
| `GET / POST` | `/api/auth/[...all]` | Public | `authRead` / `auth` |
| `POST` | `/api/games` | Authenticated | `mutation` |
| `GET` | `/api/games/active` | Authenticated | `read` |
| `GET` | `/api/games/{id}/current-round` | Authenticated | `read` |
| `POST` | `/api/games/{id}/current-round` | Authenticated | `mutation` |
| `POST` | `/api/games/{id}/rounds/{n}/guess` | Authenticated | `mutation` |
| `GET` | `/api/games/{id}/rounds/{n}/result` | Authenticated | `read` |
| `GET` | `/api/games/{id}/summary` | Authenticated | `read` |
| `POST` | `/api/games/{id}/exit` | Authenticated | `mutation` |
| `POST` | `/api/games/{id}/terminate` | Public | `mutation` |
| `GET` | `/api/profile` | Authenticated | `read` |
| `PATCH` | `/api/profile` | Authenticated | `mutation` |
| `GET` | `/api/leaderboard` | Authenticated | `read` |
| `GET` | `/api/locations` | Admin | `admin` |
| `POST` | `/api/locations` | Admin | `admin` |
| `GET` | `/api/locations/{id}` | Admin | `admin` |
| `PUT` | `/api/locations/{id}` | Admin | `admin` |
| `DELETE` | `/api/locations/{id}` | Admin | `admin` |
| `DELETE` | `/api/locations/{id}/images/{n}` | Admin | `admin` |
| `GET` | `/api/users` | Admin | `admin` |
| `PATCH` | `/api/users/{id}` | Admin | `admin` |
| `DELETE` | `/api/users/{id}` | Admin | `admin` |
| `GET` | `/api/dashboard` | Admin | `admin` |
| `GET` | `/api/dashboard/games` | Admin | `admin` |
