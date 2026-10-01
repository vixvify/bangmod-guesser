/*
  Warnings:

  - The values [HIDDEN] on the enum `LocationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "GameStatus" ADD VALUE 'INCOMPLETE';

-- AlterEnum
BEGIN;
CREATE TYPE "LocationStatus_new" AS ENUM ('ACTIVE', 'INACTIVE');
ALTER TABLE "public"."locations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "locations" ALTER COLUMN "status" TYPE "LocationStatus_new" USING ("status"::text::"LocationStatus_new");
ALTER TYPE "LocationStatus" RENAME TO "LocationStatus_old";
ALTER TYPE "LocationStatus_new" RENAME TO "LocationStatus";
DROP TYPE "public"."LocationStatus_old";
ALTER TABLE "locations" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;
