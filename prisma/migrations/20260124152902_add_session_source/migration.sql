/*
  Warnings:

  - A unique constraint covering the columns `[user_id,source]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SessionSource" AS ENUM ('WEB', 'DASHBOARD');

-- DropIndex
DROP INDEX "Session_user_id_key";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "source" "SessionSource" NOT NULL DEFAULT 'WEB';

-- CreateIndex
CREATE UNIQUE INDEX "Session_user_id_source_key" ON "Session"("user_id", "source");
