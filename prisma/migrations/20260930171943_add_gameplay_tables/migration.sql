-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "LocationStatus" AS ENUM ('ACTIVE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('PLAYING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "suspendedUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "LocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_images" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageNumber" INTEGER,
    "locationId" INTEGER NOT NULL,

    CONSTRAINT "location_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'PLAYING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalScore" INTEGER,
    "userId" TEXT NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_rounds" (
    "id" SERIAL NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "guessedLatitude" DOUBLE PRECISION,
    "guessedLongitude" DOUBLE PRECISION,
    "score" INTEGER NOT NULL DEFAULT 0,
    "playTimeSeconds" INTEGER,
    "status" "RoundStatus" DEFAULT 'PENDING',
    "gameId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,

    CONSTRAINT "game_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "location_images_locationId_idx" ON "location_images"("locationId");

-- CreateIndex
CREATE INDEX "games_userId_idx" ON "games"("userId");

-- CreateIndex
CREATE INDEX "game_rounds_gameId_idx" ON "game_rounds"("gameId");

-- CreateIndex
CREATE INDEX "game_rounds_locationId_idx" ON "game_rounds"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "game_rounds_gameId_questionNumber_key" ON "game_rounds"("gameId", "questionNumber");

-- AddForeignKey
ALTER TABLE "location_images" ADD CONSTRAINT "location_images_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
