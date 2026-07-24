"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import {
  createMarketplaceImagePath,
  validateMarketplaceImages,
} from "@/lib/marketplace-images";
import { PERMISSIONS } from "@/lib/permissions";
import { supabaseAdmin } from "@/lib/supabase-server";
import { logDelete, logStatusChange, logUpdate } from "@/services/audit-events";
const VALID_TYPES = [
  "VEHICLE",
  "MOTORCYCLE",
  "PART",
  "ACCESSORY",
  "SERVICE",
  "OTHER",
];

const VALID_STATUSES = ["DRAFT", "PUBLISHED", "SOLD", "ARCHIVED"];

const MAX_IMAGE_COUNT = 10;

function getString(formData, field) {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getOptionalString(formData, field) {
  return getString(formData, field) || null;
}

function getOptionalInteger(formData, field) {
  const value = getString(formData, field);

  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isInteger(parsedValue) ? parsedValue : null;
}

function extractStoragePath(publicUrl, bucket) {
  if (!publicUrl) {
    return null;
  }

  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
}

function getListingDates(status, listing) {
  return {
    publishedAt:
      status === "PUBLISHED"
        ? listing.publishedAt || new Date()
        : listing.publishedAt,

    soldAt: status === "SOLD" ? listing.soldAt || new Date() : null,
  };
}

function getStatusLabel(status) {
  const labels = {
    DRAFT: "Draft",
    PUBLISHED: "Publikuar",
    SOLD: "Shitur",
    ARCHIVED: "Arkivuar",
  };

  return labels[status] || status;
}

function getTypeLabel(type) {
  const labels = {
    VEHICLE: "Automjet",
    MOTORCYCLE: "Motoçikletë",
    PART: "Pjesë këmbimi",
    ACCESSORY: "Aksesor",
    SERVICE: "Shërbim",
    OTHER: "Tjetër",
  };

  return labels[type] || type;
}

function getMarketplaceAuditValues(listing) {
  return {
    title: listing.title,
    type: listing.type,
    status: listing.status,
    description: listing.description,
    price: listing.price,
    isNegotiable: listing.isNegotiable,
    category: listing.category,
    condition: listing.condition,
    city: listing.city,
    address: listing.address,
    phone: listing.phone,
    email: listing.email,
    brand: listing.brand,
    model: listing.model,
    productionYear: listing.productionYear,
    mileage: listing.mileage,
    fuelType: listing.fuelType,
    transmission: listing.transmission,
    engine: listing.engine,
    color: listing.color,
    vin: listing.vin,
    stock: listing.stock,
    publishedAt: listing.publishedAt,
    soldAt: listing.soldAt,
  };
}

function getMarketplaceStatusAuditContent({
  listing,
  previousStatus,
  newStatus,
}) {
  if (newStatus === "PUBLISHED") {
    return {
      title: `U publikua produkti "${listing.title}"`,
      description: `Produkti "${listing.title}" u publikua në Marketplace.`,
    };
  }

  if (previousStatus === "PUBLISHED" && newStatus === "DRAFT") {
    return {
      title: `U hoq nga publikimi produkti "${listing.title}"`,
      description: `Produkti "${listing.title}" u hoq nga Marketplace dhe u kthye në draft.`,
    };
  }

  if (newStatus === "SOLD") {
    return {
      title: `Produkti "${listing.title}" u shënua si i shitur`,
      description: `Produkti "${listing.title}" u shënua si i shitur në Marketplace.`,
    };
  }

  if (newStatus === "ARCHIVED") {
    return {
      title: `U arkivua produkti "${listing.title}"`,
      description: `Produkti "${listing.title}" u arkivua në Marketplace.`,
    };
  }

  return {
    title: `Ndryshoi statusi i produktit "${listing.title}"`,
    description: `Statusi i produktit "${listing.title}" ndryshoi nga "${getStatusLabel(
      previousStatus,
    )}" në "${getStatusLabel(newStatus)}".`,
  };
}

async function getManagedListing({
  listingId,
  businessId,
  includeImages = false,
}) {
  if (!listingId) {
    throw new Error("Publikimi nuk u gjet.");
  }

  const listing = await db.marketplaceListing.findFirst({
    where: {
      id: listingId,
      businessId,
    },
    ...(includeImages
      ? {
          include: {
            images: {
              orderBy: {
                position: "asc",
              },
            },
          },
        }
      : {}),
  });

  if (!listing) {
    throw new Error("Publikimi nuk ekziston ose nuk i përket biznesit aktiv.");
  }

  return listing;
}

function revalidateMarketplaceListing(listingId) {
  revalidatePath("/dashboard/marketplace");
  revalidatePath(`/dashboard/marketplace/${listingId}`);
  revalidatePath(`/dashboard/marketplace/${listingId}/edit`);
}

export async function updateMarketplaceListing(formData) {
  const context = await requireBusinessActionPermission(
    PERMISSIONS.MARKETPLACE_MANAGE,
  );

  const { businessId } = context;

  const listingId = getString(formData, "listingId");
  const title = getString(formData, "title");
  const requestedType = getString(formData, "type");
  const requestedStatus = getString(formData, "status");
  const priceValue = getString(formData, "price");

  if (title.length < 3) {
    throw new Error("Titulli duhet të ketë të paktën 3 karaktere.");
  }

  if (!VALID_TYPES.includes(requestedType)) {
    throw new Error("Lloji i publikimit nuk është i vlefshëm.");
  }

  if (!VALID_STATUSES.includes(requestedStatus)) {
    throw new Error("Statusi i publikimit nuk është i vlefshëm.");
  }

  const price = Number(priceValue);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Vendos një çmim të vlefshëm.");
  }

  const listing = await getManagedListing({
    listingId,
    businessId,
    includeImages: true,
  });

  const requestedDeleteImageIds = formData
    .getAll("deleteImageIds")
    .filter((value) => typeof value === "string");

  const deletableImages = listing.images.filter((image) =>
    requestedDeleteImageIds.includes(image.id),
  );

  const deleteImageIds = deletableImages.map((image) => image.id);

  const retainedImages = listing.images.filter(
    (image) => !deleteImageIds.includes(image.id),
  );

  const newFiles = formData
    .getAll("images")
    .filter(
      (file) => file && typeof file.arrayBuffer === "function" && file.size > 0,
    );

  validateMarketplaceImages(newFiles);

  if (retainedImages.length + newFiles.length > MAX_IMAGE_COUNT) {
    throw new Error(
      `Publikimi mund të ketë maksimumi ${MAX_IMAGE_COUNT} fotografi.`,
    );
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "marketplace-images";

  const uploadedPaths = [];
  const newImageRecords = [];

  try {
    for (const [index, file] of newFiles.entries()) {
      const position = retainedImages.length + index;

      const storagePath = createMarketplaceImagePath({
        businessId,
        listingId,
        file,
        position,
      });

      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `Ngarkimi i fotografisë "${file.name}" dështoi: ${uploadError.message}`,
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(storagePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error(
          `Nuk u krijua URL-ja publike për fotografinë "${file.name}".`,
        );
      }

      uploadedPaths.push(storagePath);

      newImageRecords.push({
        listingId,
        url: publicUrlData.publicUrl,
        alt: title,
        position,
      });
    }

    const { publishedAt, soldAt } = getListingDates(requestedStatus, listing);

    await db.$transaction(async (transaction) => {
      const updatedListing = await transaction.marketplaceListing.update({
        where: {
          id: listingId,
        },
        data: {
          type: requestedType,
          status: requestedStatus,

          title,
          description: getOptionalString(formData, "description"),

          price,
          isNegotiable: formData.get("isNegotiable") === "on",

          category: getOptionalString(formData, "category"),

          condition: getOptionalString(formData, "condition"),

          city: getOptionalString(formData, "city"),
          address: getOptionalString(formData, "address"),

          phone: getOptionalString(formData, "phone"),
          email: getOptionalString(formData, "email"),

          brand: getOptionalString(formData, "brand"),
          model: getOptionalString(formData, "model"),

          productionYear: getOptionalInteger(formData, "productionYear"),

          mileage: getOptionalInteger(formData, "mileage"),

          fuelType: getOptionalString(formData, "fuelType"),

          transmission: getOptionalString(formData, "transmission"),

          engine: getOptionalString(formData, "engine"),

          color: getOptionalString(formData, "color"),
          vin: getOptionalString(formData, "vin"),

          stock: getOptionalInteger(formData, "stock"),

          publishedAt,
          soldAt,
        },
      });

      if (deleteImageIds.length > 0) {
        await transaction.marketplaceListingImage.deleteMany({
          where: {
            listingId,
            id: {
              in: deleteImageIds,
            },
          },
        });
      }

      for (const [position, image] of retainedImages.entries()) {
        await transaction.marketplaceListingImage.update({
          where: {
            id: image.id,
          },
          data: {
            position,
            alt: title,
          },
        });
      }

      if (newImageRecords.length > 0) {
        await transaction.marketplaceListingImage.createMany({
          data: newImageRecords,
        });
      }

      await logUpdate({
        context,
        entityType: "MARKETPLACE_LISTING",
        entityId: updatedListing.id,
        title: `U përditësua produkti "${updatedListing.title}"`,
        description: `U përditësuan të dhënat e produktit "${updatedListing.title}" në Marketplace.`,
        oldValues: getMarketplaceAuditValues(listing),
        newValues: getMarketplaceAuditValues(updatedListing),
        metadata: {
          source: "marketplace-actions",
          operation: "updateMarketplaceListing",
          listingTitle: updatedListing.title,
          listingType: updatedListing.type,
          typeLabel: getTypeLabel(updatedListing.type),
          previousStatus: listing.status,
          currentStatus: updatedListing.status,
          deletedImageCount: deleteImageIds.length,
          uploadedImageCount: newImageRecords.length,
        },
        database: transaction,
      });

      if (listing.status !== updatedListing.status) {
        const statusAuditContent = getMarketplaceStatusAuditContent({
          listing: updatedListing,
          previousStatus: listing.status,
          newStatus: updatedListing.status,
        });

        await logStatusChange({
          context,
          entityType: "MARKETPLACE_LISTING",
          entityId: updatedListing.id,
          title: statusAuditContent.title,
          description: statusAuditContent.description,
          oldStatus: listing.status,
          newStatus: updatedListing.status,
          metadata: {
            source: "marketplace-actions",
            operation: "updateMarketplaceListing",
            listingTitle: updatedListing.title,
            listingType: updatedListing.type,
            typeLabel: getTypeLabel(updatedListing.type),
          },
          database: transaction,
        });
      }
    });
  } catch (error) {
    if (uploadedPaths.length > 0) {
      const { error: cleanupError } = await supabaseAdmin.storage
        .from(bucket)
        .remove(uploadedPaths);

      if (cleanupError) {
        console.error(
          "Gabim gjatë pastrimit të fotografive të reja:",
          cleanupError,
        );
      }
    }

    throw error;
  }

  const deletedStoragePaths = deletableImages
    .map((image) => extractStoragePath(image.url, bucket))
    .filter(Boolean);

  if (deletedStoragePaths.length > 0) {
    const { error: deleteStorageError } = await supabaseAdmin.storage
      .from(bucket)
      .remove(deletedStoragePaths);

    if (deleteStorageError) {
      console.error(
        "Publikimi u përditësua, por disa fotografi nuk u fshinë nga Storage:",
        deleteStorageError,
      );
    }
  }

  revalidateMarketplaceListing(listingId);

  redirect(`/dashboard/marketplace/${listingId}`);
}

export async function changeMarketplaceListingStatus(formData) {
  const context = await requireBusinessActionPermission(
    PERMISSIONS.MARKETPLACE_MANAGE,
  );

  const { businessId } = context;

  const listingId = getString(formData, "listingId");
  const requestedStatus = getString(formData, "status");

  if (!VALID_STATUSES.includes(requestedStatus)) {
    throw new Error("Statusi i publikimit nuk është i vlefshëm.");
  }

  const listing = await getManagedListing({
    listingId,
    businessId,
  });

  if (listing.status === requestedStatus) {
    revalidateMarketplaceListing(listingId);
    redirect(`/dashboard/marketplace/${listingId}`);
  }

  const { publishedAt, soldAt } = getListingDates(requestedStatus, listing);

  await db.$transaction(async (transaction) => {
    const updatedListing = await transaction.marketplaceListing.update({
      where: {
        id: listingId,
      },
      data: {
        status: requestedStatus,
        publishedAt,
        soldAt,
      },
    });

    const statusAuditContent = getMarketplaceStatusAuditContent({
      listing: updatedListing,
      previousStatus: listing.status,
      newStatus: updatedListing.status,
    });

    await logStatusChange({
      context,
      entityType: "MARKETPLACE_LISTING",
      entityId: updatedListing.id,
      title: statusAuditContent.title,
      description: statusAuditContent.description,
      oldStatus: listing.status,
      newStatus: updatedListing.status,
      metadata: {
        source: "marketplace-actions",
        operation: "changeMarketplaceListingStatus",
        listingTitle: updatedListing.title,
        listingType: updatedListing.type,
        typeLabel: getTypeLabel(updatedListing.type),
        previousStatus: listing.status,
        currentStatus: updatedListing.status,
      },
      database: transaction,
    });
  });

  revalidateMarketplaceListing(listingId);

  redirect(`/dashboard/marketplace/${listingId}`);
}

export async function deleteMarketplaceListing(formData) {
  const context = await requireBusinessActionPermission(
    PERMISSIONS.MARKETPLACE_MANAGE,
  );

  const { businessId } = context;

  const listingId = getString(formData, "listingId");

  const listing = await getManagedListing({
    listingId,
    businessId,
    includeImages: true,
  });

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "marketplace-images";

  const storagePaths = listing.images
    .map((image) => extractStoragePath(image.url, bucket))
    .filter(Boolean);

  await db.$transaction(async (transaction) => {
    await transaction.marketplaceListing.delete({
      where: {
        id: listingId,
      },
    });

    await logDelete({
      context,
      entityType: "MARKETPLACE_LISTING",
      entityId: listing.id,
      title: `U fshi produkti "${listing.title}"`,
      description: `Produkti "${listing.title}" u fshi nga Marketplace.`,
      oldValues: getMarketplaceAuditValues(listing),
      metadata: {
        source: "marketplace-actions",
        operation: "deleteMarketplaceListing",
        listingTitle: listing.title,
        listingType: listing.type,
        typeLabel: getTypeLabel(listing.type),
        listingStatus: listing.status,
        imageCount: listing.images.length,
      },
      database: transaction,
    });
  });

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabaseAdmin.storage
      .from(bucket)
      .remove(storagePaths);

    if (storageError) {
      console.error(
        "Publikimi u fshi, por disa fotografi nuk u fshinë nga Storage:",
        storageError,
      );
    }
  }

  revalidatePath("/dashboard/marketplace");

  redirect("/dashboard/marketplace");
}
