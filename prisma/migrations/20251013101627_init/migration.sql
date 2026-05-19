/*
  Warnings:

  - The values [PROCESSED,COMPLETED,CANCELLED] on the enum `Invoice_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `invoice` MODIFY `status` ENUM('DALAM_ANTRIAN', 'DIPROSES', 'DIANTAR', 'SELESAI', 'BATAL') NOT NULL DEFAULT 'DALAM_ANTRIAN',
    ALTER COLUMN `updatedAt` DROP DEFAULT;
