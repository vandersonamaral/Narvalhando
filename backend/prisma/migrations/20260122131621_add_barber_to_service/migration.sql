/*
  Warnings:

  - Added the required column `barberId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Adiciona a coluna barberId como nullable primeiro
ALTER TABLE "Service" ADD COLUMN "barberId" INTEGER;

-- Atribui os serviços existentes ao primeiro barbeiro
UPDATE "Service" SET "barberId" = (SELECT id FROM "Barber" ORDER BY id LIMIT 1) WHERE "barberId" IS NULL;

-- Torna a coluna NOT NULL
ALTER TABLE "Service" ALTER COLUMN "barberId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
