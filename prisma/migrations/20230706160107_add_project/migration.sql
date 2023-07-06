-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "projectId" TEXT,
ALTER COLUMN "id" SET DEFAULT concat('act_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "id" SET DEFAULT concat('cli_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Tenant" ALTER COLUMN "id" SET DEFAULT concat('tnt_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT concat('usr_', replace(cast(gen_random_uuid() as text), '-', ''));

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL DEFAULT concat('prj_', replace(cast(gen_random_uuid() as text), '-', '')),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
