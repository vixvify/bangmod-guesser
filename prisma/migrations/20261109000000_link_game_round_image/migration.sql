UPDATE "game_rounds" AS round
SET "imageNumber" = NULL
WHERE round."imageNumber" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "location_images" AS image
    WHERE image."locationId" = round."locationId"
      AND image."imageNumber" = round."imageNumber"
  );

ALTER TABLE "game_rounds"
ADD CONSTRAINT "game_rounds_locationId_imageNumber_fkey"
FOREIGN KEY ("locationId", "imageNumber")
REFERENCES "location_images"("locationId", "imageNumber")
ON DELETE RESTRICT ON UPDATE CASCADE;
