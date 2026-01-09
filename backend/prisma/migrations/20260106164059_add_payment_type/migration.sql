-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PENDING', 'PIX', 'CARD', 'CASH');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "paymentType" "PaymentType" DEFAULT 'PENDING';
