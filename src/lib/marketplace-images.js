const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_COUNT = 10;

export function validateMarketplaceImages(files = []) {
  if (!Array.isArray(files)) {
    throw new Error("Fotografitë nuk janë të vlefshme.");
  }

  if (files.length > MAX_IMAGE_COUNT) {
    throw new Error(`Mund të ngarkosh maksimumi ${MAX_IMAGE_COUNT} fotografi.`);
  }

  for (const file of files) {
    if (!file || typeof file.arrayBuffer !== "function") {
      throw new Error("Një nga fotografitë nuk është e vlefshme.");
    }

    if (file.size <= 0) {
      throw new Error(`Fotografia "${file.name}" është bosh.`);
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(
        `Fotografia "${file.name}" duhet të jetë JPG, PNG ose WebP.`,
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`Fotografia "${file.name}" nuk duhet të kalojë 5 MB.`);
    }
  }
}

export function getMarketplaceImageExtension(file) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  return extensions[file.type] || "jpg";
}

export function createMarketplaceImagePath({
  businessId,
  listingId,
  file,
  position,
}) {
  const extension = getMarketplaceImageExtension(file);
  const uniqueId = crypto.randomUUID();

  return `${businessId}/${listingId}/${position}-${uniqueId}.${extension}`;
}

export const MARKETPLACE_IMAGE_LIMITS = {
  maxCount: MAX_IMAGE_COUNT,
  maxSize: MAX_IMAGE_SIZE,
  allowedTypes: ALLOWED_IMAGE_TYPES,
};
