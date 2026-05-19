-- AlterTable
ALTER TABLE `galleryimage` ADD COLUMN `priceEstimate` DECIMAL(65, 30) NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `invoice` ALTER COLUMN `updatedAt` DROP DEFAULT;
