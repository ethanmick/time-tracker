/*
  Warnings:

  - Made the column `tenantId` on table `Activity` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenantId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tenantId_fkey";

-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "id" SET DEFAULT concat('act_', replace(cast(gen_random_uuid() as text), '-', '')),
ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" ALTER COLUMN "id" SET DEFAULT concat('tnt_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT concat('usr_', replace(cast(gen_random_uuid() as text), '-', '')),
ALTER COLUMN "tenantId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
