/*
  Warnings:

  - The values [MARKETPLACE] on the enum `NotificationEntity` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `MarketplaceFavorite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MarketplaceInquiry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MarketplaceListing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MarketplaceListingImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationEntity_new" AS ENUM ('SERVICE', 'VEHICLE', 'APPOINTMENT', 'CUSTOMER', 'BUSINESS', 'PAYMENT', 'SUBSCRIPTION', 'DOCUMENT', 'SYSTEM');
ALTER TABLE "Notification" ALTER COLUMN "entityType" TYPE "NotificationEntity_new" USING ("entityType"::text::"NotificationEntity_new");
ALTER TYPE "NotificationEntity" RENAME TO "NotificationEntity_old";
ALTER TYPE "NotificationEntity_new" RENAME TO "NotificationEntity";
DROP TYPE "public"."NotificationEntity_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "MarketplaceFavorite" DROP CONSTRAINT "MarketplaceFavorite_listingId_fkey";

-- DropForeignKey
ALTER TABLE "MarketplaceFavorite" DROP CONSTRAINT "MarketplaceFavorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "MarketplaceInquiry" DROP CONSTRAINT "MarketplaceInquiry_listingId_fkey";

-- DropForeignKey
ALTER TABLE "MarketplaceInquiry" DROP CONSTRAINT "MarketplaceInquiry_senderUserId_fkey";

-- DropForeignKey
ALTER TABLE "MarketplaceListing" DROP CONSTRAINT "MarketplaceListing_businessId_fkey";

-- DropForeignKey
ALTER TABLE "MarketplaceListing" DROP CONSTRAINT "MarketplaceListing_sellerUserId_fkey";

-- DropForeignKey
ALTER TABLE "MarketplaceListingImage" DROP CONSTRAINT "MarketplaceListingImage_listingId_fkey";

-- DropTable
DROP TABLE "MarketplaceFavorite";

-- DropTable
DROP TABLE "MarketplaceInquiry";

-- DropTable
DROP TABLE "MarketplaceListing";

-- DropTable
DROP TABLE "MarketplaceListingImage";

-- DropEnum
DROP TYPE "MarketplaceListingStatus";

-- DropEnum
DROP TYPE "MarketplaceListingType";

-- DropEnum
DROP TYPE "MarketplaceSellerType";
