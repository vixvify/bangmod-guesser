-- Existing rounds remain unopened; never derive round timing from creation time.
ALTER TABLE "game_rounds" ADD COLUMN "startedAt" TIMESTAMP(3);
