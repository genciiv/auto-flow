"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCustomerActionContext } from "@/lib/customer-context";
import { db } from "@/lib/db";
import {
  createMarketplaceImagePath,
  validateMarketplaceImages,
} from "@/lib/marketplace-images";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getFirstValidationMessage, validateObject } from "@/lib/validation";
import {
  changeCustomerMarketplaceStatusSchema,
  createCustomerMarketplaceListingSchema,
  deleteCustomerMarketplaceListingSchema,
  updateCustomerMarketplaceListingSchema,
} from "@/schemas/customer-marketplace-schema";

const MAX_IMAGES = 10;

function getString(formData, key) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getListingInput(formData) {
  return {
    type: getString(formData, "type"),
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    price: getString(formData, "price"),
    isNegotiable: formData.get("isNegotiable"),
    category: getString(formData, "category"),
    condition: getString(formData, "condition"),
    city: getString(formData, "city"),
    address: getString(formData, "address"),
    phone: getString(formData, "phone"),
    email: getString(formData, "email"),
    brand: getString(formData, "brand"),
    model: getString(formData, "model"),
    productionYear: getString(formData, "productionYear"),
    mileage: getString(formData, "mileage"),
    fuelType: getString(formData, "fuelType"),
    transmission: getString(formData, "transmission"),
    engine: getString(formData, "engine"),
    color: getString(formData, "color"),
    vin: getString(formData, "vin"),
    stock: getString(formData, "stock"),
  };
}

function getUploadedFiles(formData) {
  return formData
    .getAll("images")
    .filter(
      (file) =>
        file &&
        typeof file.arrayBuffer === "function" &&
        typeof file.size === "number" &&
        file.size > 0,
    );
}

function getDeletedImageIds(formData) {
  return formData
    .getAll("deleteImageIds")
    .filter((value) => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function slugify(title) {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  const uniqueSuffix = `${Date.now()}-${crypto.randomUUID().slice(0, 6)}`;

  return `${base || "publikim"}-${uniqueSuffix}`;
}

function storagePathFromUrl(url, bucket) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url?.indexOf(marker);

  if (index < 0) {
    return null;
  }

  try {
    return decodeURIComponent(url.slice(index + marker.length));
  } catch {
    return null;
  }
}

function throwValidationError(validationResult, fallbackMessage) {
  if (validationResult.success) {
    return validationResult.data;
  }

  throw new Error(
    getFirstValidationMessage(validationResult.error, fallbackMessage),
  );
}

async function getCustomerProfile(profileId) {
  const profile = await db.customerProfile.findUnique({
    where: {
      id: profileId,
    },

    select: {
      userId: true,
      phone: true,
      city: true,
      address: true,

      user: {
        select: {
          email: true,
          isActive: true,
        },
      },
    },
  });

  if (!profile?.userId || !profile.user?.isActive) {
    throw new Error(
      "Profili i klientit nuk u gjet ose llogaria është çaktivizuar.",
    );
  }

  return profile;
}

async function getOwnedListing(
  listingId,
  userId,
  { includeImages = false } = {},
) {
  const listing = await db.marketplaceListing.findFirst({
    where: {
      id: listingId,
      sellerType: "USER",
      sellerUserId: userId,
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
    throw new Error("Publikimi nuk ekziston ose nuk të përket ty.");
  }

  return listing;
}

function revalidateCustomerListingPaths(listing = null) {
  revalidatePath("/marketplace");
  revalidatePath("/customer/listings");
  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/favorites");

  if (listing?.id) {
    revalidatePath(`/customer/listings/${listing.id}/edit`);
  }

  if (listing?.slug) {
    revalidatePath(`/marketplace/${listing.slug}`);
  }
}

async function removeStoragePaths(bucket, paths) {
  if (!paths.length) {
    return;
  }

  const { error } = await supabaseAdmin.storage.from(bucket).remove(paths);

  if (error) {
    console.error("Fotografitë nuk mund të fshiheshin nga storage:", error);
  }
}

async function uploadMarketplaceImages(
  files,
  { listingId, userId, title, startPosition = 0 },
) {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "marketplace-images";

  const uploadedPaths = [];
  const imageRows = [];

  try {
    for (const [index, file] of files.entries()) {
      const position = startPosition + index;

      const path = createMarketplaceImagePath({
        businessId: `user-${userId}`,
        listingId,
        file,
        position,
      });

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(path, Buffer.from(await file.arrayBuffer()), {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `Ngarkimi i fotografisë "${file.name}" dështoi: ${uploadError.message}`,
        );
      }

      uploadedPaths.push(path);

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(path);

      if (!publicUrlData?.publicUrl) {
        throw new Error("Nuk u krijua URL-ja publike e fotografisë.");
      }

      imageRows.push({
        listingId,
        url: publicUrlData.publicUrl,
        alt: title,
        position,
      });
    }

    return {
      bucket,
      paths: uploadedPaths,
      rows: imageRows,
    };
  } catch (error) {
    await removeStoragePaths(bucket, uploadedPaths);

    throw error;
  }
}

export async function createCustomerMarketplaceListing(formData) {
  const { profileId } = await requireCustomerActionContext();

  const profile = await getCustomerProfile(profileId);

  const validationResult = validateObject(
    createCustomerMarketplaceListingSchema,
    {
      ...getListingInput(formData),

      status:
        getString(formData, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    },
  );

  const data = throwValidationError(
    validationResult,
    "Kontrollo të dhënat e publikimit.",
  );

  const files = getUploadedFiles(formData);

  validateMarketplaceImages(files);

  if (files.length > MAX_IMAGES) {
    throw new Error(`Maksimumi është ${MAX_IMAGES} fotografi.`);
  }

  const listingId = crypto.randomUUID();

  const uploaded = await uploadMarketplaceImages(files, {
    listingId,
    userId: profile.userId,
    title: data.title,
  });

  let createdListing;

  try {
    createdListing = await db.marketplaceListing.create({
      data: {
        id: listingId,
        sellerType: "USER",
        sellerUserId: profile.userId,
        businessId: null,

        type: data.type,
        title: data.title,
        description: data.description,
        price: data.price,
        isNegotiable: data.isNegotiable,
        category: data.category,
        condition: data.condition,

        city: data.city || profile.city,
        address: data.address || profile.address,
        phone: data.phone || profile.phone,
        email: data.email || profile.user.email,

        brand: data.brand,
        model: data.model,
        productionYear: data.productionYear,
        mileage: data.mileage,
        fuelType: data.fuelType,
        transmission: data.transmission,
        engine: data.engine,
        color: data.color,
        vin: data.vin,
        stock: data.stock,

        status: data.status,
        slug: slugify(data.title),

        publishedAt: data.status === "PUBLISHED" ? new Date() : null,

        soldAt: null,

        images: uploaded.rows.length
          ? {
              create: uploaded.rows.map(
                ({ listingId: ignoredId, ...row }) => row,
              ),
            }
          : undefined,
      },
    });
  } catch (error) {
    await removeStoragePaths(uploaded.bucket, uploaded.paths);

    throw error;
  }

  revalidateCustomerListingPaths(createdListing);

  redirect("/customer/listings");
}

export async function updateCustomerMarketplaceListing(formData) {
  const { profileId } = await requireCustomerActionContext();

  const profile = await getCustomerProfile(profileId);

  const validationResult = validateObject(
    updateCustomerMarketplaceListingSchema,
    {
      ...getListingInput(formData),
      listingId: getString(formData, "listingId"),
      status: getString(formData, "status"),
      deleteImageIds: getDeletedImageIds(formData),
    },
  );

  const data = throwValidationError(
    validationResult,
    "Kontrollo të dhënat e publikimit.",
  );

  const listing = await getOwnedListing(data.listingId, profile.userId, {
    includeImages: true,
  });

  const validDeleteIds = new Set(listing.images.map((image) => image.id));

  const deleteImageIds = [
    ...new Set(
      data.deleteImageIds.filter((imageId) => validDeleteIds.has(imageId)),
    ),
  ];

  const removedImages = listing.images.filter((image) =>
    deleteImageIds.includes(image.id),
  );

  const keptImages = listing.images.filter(
    (image) => !deleteImageIds.includes(image.id),
  );

  const files = getUploadedFiles(formData);

  validateMarketplaceImages(files);

  if (keptImages.length + files.length > MAX_IMAGES) {
    throw new Error(`Maksimumi është ${MAX_IMAGES} fotografi.`);
  }

  const uploaded = await uploadMarketplaceImages(files, {
    listingId: listing.id,
    userId: profile.userId,
    title: data.title,
    startPosition: keptImages.length,
  });

  try {
    await db.$transaction(async (transaction) => {
      await transaction.marketplaceListing.update({
        where: {
          id: listing.id,
        },

        data: {
          type: data.type,
          title: data.title,
          description: data.description,
          price: data.price,
          isNegotiable: data.isNegotiable,
          category: data.category,
          condition: data.condition,
          city: data.city,
          address: data.address,
          phone: data.phone,
          email: data.email,
          brand: data.brand,
          model: data.model,
          productionYear: data.productionYear,
          mileage: data.mileage,
          fuelType: data.fuelType,
          transmission: data.transmission,
          engine: data.engine,
          color: data.color,
          vin: data.vin,
          stock: data.stock,
          status: data.status,

          publishedAt:
            data.status === "PUBLISHED"
              ? listing.publishedAt || new Date()
              : listing.publishedAt,

          soldAt: data.status === "SOLD" ? listing.soldAt || new Date() : null,
        },
      });

      if (deleteImageIds.length) {
        await transaction.marketplaceListingImage.deleteMany({
          where: {
            listingId: listing.id,

            id: {
              in: deleteImageIds,
            },
          },
        });
      }

      for (const [position, image] of keptImages.entries()) {
        await transaction.marketplaceListingImage.update({
          where: {
            id: image.id,
          },

          data: {
            position,
            alt: data.title,
          },
        });
      }

      if (uploaded.rows.length) {
        await transaction.marketplaceListingImage.createMany({
          data: uploaded.rows,
        });
      }
    });
  } catch (error) {
    await removeStoragePaths(uploaded.bucket, uploaded.paths);

    throw error;
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "marketplace-images";

  const removedStoragePaths = removedImages
    .map((image) => storagePathFromUrl(image.url, bucket))
    .filter(Boolean);

  await removeStoragePaths(bucket, removedStoragePaths);

  revalidateCustomerListingPaths(listing);

  redirect("/customer/listings");
}

export async function changeCustomerListingStatus(formData) {
  const { profileId } = await requireCustomerActionContext();

  const profile = await getCustomerProfile(profileId);

  const validationResult = validateObject(
    changeCustomerMarketplaceStatusSchema,
    {
      listingId: getString(formData, "listingId"),
      status: getString(formData, "status"),
    },
  );

  const data = throwValidationError(
    validationResult,
    "Të dhënat e statusit nuk janë të vlefshme.",
  );

  const listing = await getOwnedListing(data.listingId, profile.userId);

  if (listing.status !== data.status) {
    await db.marketplaceListing.update({
      where: {
        id: listing.id,
      },

      data: {
        status: data.status,

        publishedAt:
          data.status === "PUBLISHED"
            ? listing.publishedAt || new Date()
            : listing.publishedAt,

        soldAt: data.status === "SOLD" ? listing.soldAt || new Date() : null,
      },
    });
  }

  revalidateCustomerListingPaths(listing);

  redirect("/customer/listings");
}

export async function deleteCustomerMarketplaceListing(formData) {
  const { profileId } = await requireCustomerActionContext();

  const profile = await getCustomerProfile(profileId);

  const validationResult = validateObject(
    deleteCustomerMarketplaceListingSchema,
    {
      listingId: getString(formData, "listingId"),
    },
  );

  const data = throwValidationError(
    validationResult,
    "ID-ja e publikimit mungon.",
  );

  const listing = await getOwnedListing(data.listingId, profile.userId, {
    includeImages: true,
  });

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "marketplace-images";

  const storagePaths = listing.images
    .map((image) => storagePathFromUrl(image.url, bucket))
    .filter(Boolean);

  await db.marketplaceListing.delete({
    where: {
      id: listing.id,
    },
  });

  await removeStoragePaths(bucket, storagePaths);

  revalidateCustomerListingPaths(listing);

  redirect("/customer/listings");
}
