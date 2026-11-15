BEGIN;
LOCK TABLE "games" IN SHARE ROW EXCLUSIVE MODE;

-- Keep the newest active game for accounts that already have multiple games.
WITH ranked_games AS (
  SELECT "id", ROW_NUMBER() OVER (
    PARTITION BY "userId" ORDER BY "startedAt" DESC, "id" DESC
  ) AS position
  FROM "games"
  WHERE "status" = 'PLAYING'
)
UPDATE "games" AS game
SET "status" = 'INCOMPLETE', "finishedAt" = CURRENT_TIMESTAMP
FROM ranked_games
WHERE game."id" = ranked_games."id" AND ranked_games.position > 1;

CREATE UNIQUE INDEX "games_one_playing_per_user"
ON "games" ("userId") WHERE "status" = 'PLAYING';

COMMIT;
