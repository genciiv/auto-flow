"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/lib/db";

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function isValidEmail(email) {
  if (!email) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createMarketplaceInquiryAction(previousState, formData) {
  const listingId = normalizeText(formData.get("listingId"));
  const slug = normalizeText(formData.get("slug"));

  const name = normalizeText(formData.get("name"));
  const email = normalizeEmail(formData.get("email"));
  const phone = normalizeText(formData.get("phone"));
  const message = normalizeText(formData.get("message"));

  if (!listingId || !slug) {
    return {
      success: false,
      error: "Publikimi nuk është i vlefshëm.",
      message: null,
    };
  }

  if (name.length < 2) {
    return {
      success: false,
      error: "Shkruaj emrin dhe mbiemrin.",
      message: null,
    };
  }

  if (name.length > 100) {
    return {
      success: false,
      error: "Emri nuk mund të ketë më shumë se 100 karaktere.",
      message: null,
    };
  }

  if (!email && !phone) {
    return {
      success: false,
      error:
        "Shkruaj të paktën një email ose numër telefoni që shitësi të mund të të kontaktojë.",
      message: null,
    };
  }

  if (!isValidEmail(email)) {
    return {
      success: false,
      error: "Shkruaj një adresë email-i të vlefshme.",
      message: null,
    };
  }

  if (email.length > 150) {
    return {
      success: false,
      error: "Email-i është shumë i gjatë.",
      message: null,
    };
  }

  if (phone.length > 30) {
    return {
      success: false,
      error: "Numri i telefonit është shumë i gjatë.",
      message: null,
    };
  }

  if (message.length < 10) {
    return {
      success: false,
      error: "Mesazhi duhet të ketë të paktën 10 karaktere.",
      message: null,
    };
  }

  if (message.length > 2000) {
    return {
      success: false,
      error: "Mesazhi nuk mund të ketë më shumë se 2000 karaktere.",
      message: null,
    };
  }

  try {
    const listing = await db.marketplaceListing.findFirst({
      where: {
        id: listingId,
        slug,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        slug: true,
      },
    });

    if (!listing) {
      return {
        success: false,
        error: "Ky publikim nuk është më aktiv ose nuk është i disponueshëm.",
        message: null,
      };
    }

    const session = await auth();

    await db.marketplaceInquiry.create({
      data: {
        listingId: listing.id,
        senderUserId: session?.user?.id ?? null,
        name,
        email: email || null,
        phone: phone || null,
        message,
        isRead: false,
      },
    });

    revalidatePath(`/marketplace/${listing.slug}`);

    return {
      success: true,
      error: null,
      message:
        "Kërkesa u dërgua me sukses. Shitësi do të të kontaktojë së shpejti.",
    };
  } catch (error) {
    console.error("Gabim gjatë krijimit të kërkesës:", error);

    return {
      success: false,
      error: "Nuk ishte e mundur të dërgohej kërkesa. Provo përsëri pas pak.",
      message: null,
    };
  }
}
