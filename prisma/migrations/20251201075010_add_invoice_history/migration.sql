-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `estimatedFinishedAt` DATETIME(3) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `InvoiceHistory` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('DALAM_ANTRIAN', 'DIPROSES', 'DIANTAR', 'SELESAI', 'BATAL') NOT NULL,
    `note` VARCHAR(191) NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InvoiceHistory` ADD CONSTRAINT `InvoiceHistory_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
