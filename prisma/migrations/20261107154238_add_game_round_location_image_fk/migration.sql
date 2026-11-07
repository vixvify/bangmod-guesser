-- AddForeignKey
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_locationId_imageNumber_fkey" FOREIGN KEY ("locationId", "imageNumber") REFERENCES "location_images"("locationId", "imageNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
