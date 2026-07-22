"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessActionPermission } from "@/lib/business-context";

export async function markMarketplaceInquiryAsReadAction(inquiryId) {
  const { businessId } = await requireBusinessActionPermission(
    PERMISSIONS.MARKETPLACE_MANAGE,
  );

  if (!inquiryId || typeof inquiryId !== "string") {
    return {
      success: false,
      error: "Kërkesa nuk është e vlefshme.",
    };
  }

  try {
    const inquiry = await db.marketplaceInquiry.findFirst({
      where: {
        id: inquiryId,

        listing: {
          businessId,
        },
      },

      select: {
        id: true,
        isRead: true,
      },
    });

    if (!inquiry) {
      return {
        success: false,
        error: "Kërkesa nuk u gjet.",
      };
    }

    if (!inquiry.isRead) {
      await db.marketplaceInquiry.update({
        where: {
          id: inquiry.id,
        },

        data: {
          isRead: true,
        },
      });
    }

    revalidatePath("/dashboard/marketplace");
    revalidatePath("/dashboard/marketplace/inquiries");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Gabim gjatë shënimit të kërkesës si të lexuar:", error);

    return {
      success: false,
      error: "Nuk ishte e mundur të përditësohej kërkesa.",
    };
  }
}

export async function markMarketplaceInquiryAsUnreadAction(inquiryId) {
  const { businessId } = await requireBusinessActionPermission(
    PERMISSIONS.MARKETPLACE_MANAGE,
  );

  if (!inquiryId || typeof inquiryId !== "string") {
    return {
      success: false,
      error: "Kërkesa nuk është e vlefshme.",
    };
  }

  try {
    const inquiry = await db.marketplaceInquiry.findFirst({
      where: {
        id: inquiryId,

        listing: {
          businessId,
        },
      },

      select: {
        id: true,
      },
    });

    if (!inquiry) {
      return {
        success: false,
        error: "Kërkesa nuk u gjet.",
      };
    }

    await db.marketplaceInquiry.update({
      where: {
        id: inquiry.id,
      },

      data: {
        isRead: false,
      },
    });

    revalidatePath("/dashboard/marketplace");
    revalidatePath("/dashboard/marketplace/inquiries");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Gabim gjatë shënimit të kërkesës si të palexuar:", error);

    return {
      success: false,
      error: "Nuk ishte e mundur të përditësohej kërkesa.",
    };
  }
}
