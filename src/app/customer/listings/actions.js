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

const VALID_TYPES = [
  "VEHICLE",
  "MOTORCYCLE",
  "PART",
  "ACCESSORY",
  "SERVICE",
  "OTHER",
];
const VALID_STATUSES = ["DRAFT", "PUBLISHED", "SOLD", "ARCHIVED"];
const MAX_IMAGES = 10;

const str = (fd, k) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};
const opt = (fd, k) => str(fd, k) || null;
const int = (fd, k) => {
  const v = str(fd, k);
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  return Number.isInteger(n) ? n : null;
};

function slugify(title) {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return `${base || "publikim"}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function storagePathFromUrl(url, bucket) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url?.indexOf(marker);
  return i >= 0 ? decodeURIComponent(url.slice(i + marker.length)) : null;
}
async function profileFor(profileId) {
  const p = await db.customerProfile.findUnique({
    where: { id: profileId },
    select: {
      userId: true,
      phone: true,
      city: true,
      address: true,
      user: { select: { email: true } },
    },
  });
  if (!p?.userId) throw new Error("Profili i klientit nuk u gjet.");
  return p;
}
async function owned(id, userId, images = false) {
  const listing = await db.marketplaceListing.findFirst({
    where: { id, sellerType: "USER", sellerUserId: userId },
    ...(images
      ? { include: { images: { orderBy: { position: "asc" } } } }
      : {}),
  });
  if (!listing) throw new Error("Publikimi nuk ekziston ose nuk të përket ty.");
  return listing;
}
function refresh(listing) {
  revalidatePath("/marketplace");
  revalidatePath("/customer/listings");
  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/favorites");
  if (listing?.id) revalidatePath(`/customer/listings/${listing.id}/edit`);
  if (listing?.slug) revalidatePath(`/marketplace/${listing.slug}`);
}
async function upload(files, { listingId, userId, title, start = 0 }) {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "marketplace-images";
  const paths = [];
  const rows = [];
  for (const [i, file] of files.entries()) {
    const path = createMarketplaceImagePath({
      businessId: `user-${userId}`,
      listingId,
      file,
      position: start + i,
    });
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
    if (error) {
      if (paths.length) await supabaseAdmin.storage.from(bucket).remove(paths);
      throw new Error(
        `Ngarkimi i fotografisë "${file.name}" dështoi: ${error.message}`,
      );
    }
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    if (!data?.publicUrl)
      throw new Error("Nuk u krijua URL-ja publike e fotografisë.");
    paths.push(path);
    rows.push({
      listingId,
      url: data.publicUrl,
      alt: title,
      position: start + i,
    });
  }
  return { bucket, paths, rows };
}
function commonData(fd) {
  return {
    type: str(fd, "type"),
    title: str(fd, "title"),
    description: opt(fd, "description"),
    price: Number(str(fd, "price")),
    isNegotiable: fd.get("isNegotiable") === "on",
    category: opt(fd, "category"),
    condition: opt(fd, "condition"),
    city: opt(fd, "city"),
    address: opt(fd, "address"),
    phone: opt(fd, "phone"),
    email: opt(fd, "email"),
    brand: opt(fd, "brand"),
    model: opt(fd, "model"),
    productionYear: int(fd, "productionYear"),
    mileage: int(fd, "mileage"),
    fuelType: opt(fd, "fuelType"),
    transmission: opt(fd, "transmission"),
    engine: opt(fd, "engine"),
    color: opt(fd, "color"),
    vin: opt(fd, "vin"),
    stock: int(fd, "stock"),
  };
}
function validate(data) {
  if (data.title.length < 3)
    throw new Error("Titulli duhet të ketë të paktën 3 karaktere.");
  if (!VALID_TYPES.includes(data.type))
    throw new Error("Lloji nuk është i vlefshëm.");
  if (!Number.isFinite(data.price) || data.price < 0)
    throw new Error("Vendos një çmim të vlefshëm.");
}

export async function createCustomerMarketplaceListing(formData) {
  const { profileId } = await requireCustomerActionContext();
  const profile = await profileFor(profileId);
  const data = commonData(formData);
  validate(data);
  const status =
    str(formData, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const files = formData
    .getAll("images")
    .filter((f) => f && typeof f.arrayBuffer === "function" && f.size > 0);
  validateMarketplaceImages(files);
  const id = crypto.randomUUID();
  const uploaded = await upload(files, {
    listingId: id,
    userId: profile.userId,
    title: data.title,
  });
  try {
    await db.marketplaceListing.create({
      data: {
        id,
        sellerType: "USER",
        sellerUserId: profile.userId,
        businessId: null,
        ...data,
        city: data.city || profile.city,
        address: data.address || profile.address,
        phone: data.phone || profile.phone,
        email: data.email || profile.user?.email,
        status,
        slug: slugify(data.title),
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        images: uploaded.rows.length
          ? { create: uploaded.rows.map(({ listingId, ...x }) => x) }
          : undefined,
      },
    });
  } catch (e) {
    if (uploaded.paths.length)
      await supabaseAdmin.storage.from(uploaded.bucket).remove(uploaded.paths);
    throw e;
  }
  refresh({ id });
  redirect("/customer/listings");
}

export async function updateCustomerMarketplaceListing(formData) {
  const { profileId } = await requireCustomerActionContext();
  const profile = await profileFor(profileId);
  const id = str(formData, "listingId");
  const listing = await owned(id, profile.userId, true);
  const data = commonData(formData);
  validate(data);
  const status = str(formData, "status");
  if (!VALID_STATUSES.includes(status))
    throw new Error("Statusi nuk është i vlefshëm.");
  const deleteIds = formData
    .getAll("deleteImageIds")
    .filter((v) => typeof v === "string");
  const removed = listing.images.filter((x) => deleteIds.includes(x.id));
  const kept = listing.images.filter((x) => !deleteIds.includes(x.id));
  const files = formData
    .getAll("images")
    .filter((f) => f && typeof f.arrayBuffer === "function" && f.size > 0);
  validateMarketplaceImages(files);
  if (kept.length + files.length > MAX_IMAGES)
    throw new Error(`Maksimumi ${MAX_IMAGES} fotografi.`);
  const uploaded = await upload(files, {
    listingId: id,
    userId: profile.userId,
    title: data.title,
    start: kept.length,
  });
  try {
    await db.$transaction(async (tx) => {
      await tx.marketplaceListing.update({
        where: { id },
        data: {
          ...data,
          status,
          publishedAt:
            status === "PUBLISHED"
              ? listing.publishedAt || new Date()
              : listing.publishedAt,
          soldAt: status === "SOLD" ? listing.soldAt || new Date() : null,
        },
      });
      if (deleteIds.length)
        await tx.marketplaceListingImage.deleteMany({
          where: { listingId: id, id: { in: deleteIds } },
        });
      for (const [position, img] of kept.entries())
        await tx.marketplaceListingImage.update({
          where: { id: img.id },
          data: { position, alt: data.title },
        });
      if (uploaded.rows.length)
        await tx.marketplaceListingImage.createMany({ data: uploaded.rows });
    });
  } catch (e) {
    if (uploaded.paths.length)
      await supabaseAdmin.storage.from(uploaded.bucket).remove(uploaded.paths);
    throw e;
  }
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "marketplace-images";
  const paths = removed
    .map((x) => storagePathFromUrl(x.url, bucket))
    .filter(Boolean);
  if (paths.length) await supabaseAdmin.storage.from(bucket).remove(paths);
  refresh(listing);
  redirect("/customer/listings");
}

export async function changeCustomerListingStatus(formData) {
  const { profileId } = await requireCustomerActionContext();
  const profile = await profileFor(profileId);
  const listing = await owned(str(formData, "listingId"), profile.userId);
  const status = str(formData, "status");
  if (!VALID_STATUSES.includes(status))
    throw new Error("Statusi nuk është i vlefshëm.");
  await db.marketplaceListing.update({
    where: { id: listing.id },
    data: {
      status,
      publishedAt:
        status === "PUBLISHED"
          ? listing.publishedAt || new Date()
          : listing.publishedAt,
      soldAt: status === "SOLD" ? listing.soldAt || new Date() : null,
    },
  });
  refresh(listing);
  redirect("/customer/listings");
}

export async function deleteCustomerMarketplaceListing(formData) {
  const { profileId } = await requireCustomerActionContext();
  const profile = await profileFor(profileId);
  const listing = await owned(str(formData, "listingId"), profile.userId, true);
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "marketplace-images";
  const paths = listing.images
    .map((x) => storagePathFromUrl(x.url, bucket))
    .filter(Boolean);
  await db.marketplaceListing.delete({ where: { id: listing.id } });
  if (paths.length) await supabaseAdmin.storage.from(bucket).remove(paths);
  refresh(listing);
  redirect("/customer/listings");
}
