/*
  Warnings:

  - You are about to drop the column `suspendedUntil` on the `users` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'INACTIVE';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "suspendedUntil";
