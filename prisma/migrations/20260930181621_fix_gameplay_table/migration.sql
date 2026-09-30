/*
  Warnings:

  - The primary key for the `game_rounds` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `game_rounds` table. All the data in the column will be lost.
  - The primary key for the `games` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `location_images` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `location_images` table. All the data in the column will be lost.
  - The primary key for the `locations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `imageNumber` on table `location_images` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "game_rounds" DROP CONSTRAINT "game_rounds_gameId_fkey";

-- DropForeignKey
ALTER TABLE "game_rounds" DROP CONSTRAINT "game_rounds_locationId_fkey";

-- DropForeignKey
ALTER TABLE "location_images" DROP CONSTRAINT "location_images_locationId_fkey";

-- AlterTable
ALTER TABLE "game_rounds" DROP CONSTRAINT "game_rounds_pkey",
DROP COLUMN "id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "gameId" SET DATA TYPE TEXT,
ALTER COLUMN "locationId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "games" DROP CONSTRAINT "games_pkey",
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "games_id_seq";

-- AlterTable
ALTER TABLE "location_images" DROP CONSTRAINT "location_images_pkey",
DROP COLUMN "id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "imageNumber" SET NOT NULL,
ALTER COLUMN "locationId" SET DATA TYPE TEXT,
ADD CONSTRAINT "location_images_pkey" PRIMARY KEY ("locationId", "imageNumber");

-- AlterTable
ALTER TABLE "locations" DROP CONSTRAINT "locations_pkey",
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "locations_id_seq";

-- AddForeignKey
ALTER TABLE "location_images" ADD CONSTRAINT "location_images_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
