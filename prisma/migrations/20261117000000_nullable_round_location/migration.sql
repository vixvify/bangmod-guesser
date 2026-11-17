ALTER TABLE "game_rounds" DROP CONSTRAINT "game_rounds_locationId_fkey";
ALTER TABLE "game_rounds" ALTER COLUMN "locationId" DROP NOT NULL;
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_locationId_fkey"
  FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
