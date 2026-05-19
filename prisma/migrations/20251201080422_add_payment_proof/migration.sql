-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `paymentProof` VARCHAR(191) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;
