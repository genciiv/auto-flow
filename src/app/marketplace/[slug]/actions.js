"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getFirstValidationMessage, validateFormData } from "@/lib/validation";
import { publicMarketplaceInquirySchema } from "@/schemas/marketplace-schema";
import { protectPublicAction, rateLimitActionState } from "@/lib/public-action-protection";

const initialResult = {
  success: false,
  error: null,
  message: null,
};

export async function createMarketplaceInquiryAction(previousState, formData) {
  const validationResult = validateFormData(
    publicMarketplaceInquirySchema,
    formData,
  );

  if (!validationResult.success) {
    return {
      ...initialResult,
      error: getFirstValidationMessage(
        validationResult.error,
        "Kontrollo të dhënat e formularit.",
      ),
    };
  }

  const { listingId, slug, name, email, phone, message } =
    validationResult.data;

  try {
    await protectPublicAction("marketplaceInquiry", `${listingId}:${email}`);
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
        ...initialResult,
        error: "Ky publikim nuk është më aktiv ose nuk është i disponueshëm.",
      };
    }

    const session = await auth();

    await db.marketplaceInquiry.create({
      data: {
        listingId: listing.id,
        senderUserId: session?.user?.id ?? null,
        name,
        email,
        phone,
        message,
        isRead: false,
      },
    });

    revalidatePath(`/marketplace/${listing.slug}`);

    revalidatePath("/dashboard/marketplace/inquiries");

    return {
      success: true,
      error: null,
      message:
        "Kërkesa u dërgua me sukses. Shitësi do të të kontaktojë së shpejti.",
    };
  } catch (error) {
    const limited = rateLimitActionState(error, initialResult);
    if (limited) return limited;
    console.error("Gabim gjatë krijimit të kërkesës:", error);

    return {
      ...initialResult,
      error: "Nuk ishte e mundur të dërgohej kërkesa. Provo përsëri pas pak.",
    };
  }
}
