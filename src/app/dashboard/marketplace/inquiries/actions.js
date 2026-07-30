"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import { getFirstValidationMessage, validateObject } from "@/lib/validation";
import { marketplaceInquiryIdSchema } from "@/schemas/marketplace-schema";

function refreshMarketplaceInquiryPages() {
  revalidatePath("/dashboard/marketplace");
  revalidatePath("/dashboard/marketplace/inquiries");
}

function getInquiryValidationResult(inquiryId) {
  return validateObject(marketplaceInquiryIdSchema, {
    inquiryId,
  });
}

export async function markMarketplaceInquiryAsReadAction(inquiryId) {
  const { businessId } = await requireBusinessActionPermission(
    PERMISSIONS.MARKETPLACE_MANAGE,
  );

  const validationResult = getInquiryValidationResult(inquiryId);

  if (!validationResult.success) {
    return {
      success: false,
      error: getFirstValidationMessage(
        validationResult.error,
        "Kërkesa nuk është e vlefshme.",
      ),
    };
  }

  const validatedInquiryId = validationResult.data.inquiryId;

  try {
    const inquiry = await db.marketplaceInquiry.findFirst({
      where: {
        id: validatedInquiryId,

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

    refreshMarketplaceInquiryPages();

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

  const validationResult = getInquiryValidationResult(inquiryId);

  if (!validationResult.success) {
    return {
      success: false,
      error: getFirstValidationMessage(
        validationResult.error,
        "Kërkesa nuk është e vlefshme.",
      ),
    };
  }

  const validatedInquiryId = validationResult.data.inquiryId;

  try {
    const inquiry = await db.marketplaceInquiry.findFirst({
      where: {
        id: validatedInquiryId,

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

    if (inquiry.isRead) {
      await db.marketplaceInquiry.update({
        where: {
          id: inquiry.id,
        },

        data: {
          isRead: false,
        },
      });
    }

    refreshMarketplaceInquiryPages();

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
