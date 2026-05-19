-- AlterTable
ALTER TABLE `invoice` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `link` ADD COLUMN `icon` VARCHAR(191) NOT NULL DEFAULT 'Default';
