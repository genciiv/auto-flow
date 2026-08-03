"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import { getFirstValidationMessage, validateFormData } from "@/lib/validation";
import {
  businessSettingsSchema,
  profileSettingsSchema,
} from "@/schemas/settings-schema";

function getErrorMessage(error) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.join(",")
      : String(error.meta?.target || "");

    if (target.includes("email")) {
      return "Ky email përdoret tashmë nga një llogari tjetër.";
    }

    if (target.includes("nipt")) {
      return "Ky NIPT përdoret tashmë nga një biznes tjetër.";
    }

    return "Një nga të dhënat e vendosura ekziston tashmë.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Ndodhi një gabim i papritur. Provo përsëri.";
}

function getValidationErrorMessage(validationResult, fallbackMessage) {
  return getFirstValidationMessage(validationResult.error, fallbackMessage);
}

function revalidateProfileSettingsPages() {
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard", "layout");
}

function revalidateBusinessSettingsPages() {
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard", "layout");
}

export async function updateProfileSettings(formData) {
  try {
    const { userId } = await requireBusinessActionPermission(
      PERMISSIONS.SETTINGS_UPDATE,
    );

    const validationResult = validateFormData(profileSettingsSchema, formData);

    if (!validationResult.success) {
      return {
        success: false,

        message: getValidationErrorMessage(
          validationResult,
          "Të dhënat e profilit nuk janë të vlefshme.",
        ),
      };
    }

    const { name, phone } = validationResult.data;

    const existingUser = await db.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
      },
    });

    if (!existingUser) {
      return {
        success: false,
        message: "Përdoruesi nuk u gjet.",
      };
    }

    await db.user.update({
      where: {
        id: userId,
      },

      data: {
        name,
        phone,
      },
    });

    revalidateProfileSettingsPages();

    return {
      success: true,
      message: "Profili u përditësua me sukses.",
    };
  } catch (error) {
    console.error("updateProfileSettings error:", error);

    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function updateBusinessSettings(formData) {
  try {
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.SETTINGS_UPDATE,
    );

    const validationResult = validateFormData(businessSettingsSchema, formData);

    if (!validationResult.success) {
      return {
        success: false,

        message: getValidationErrorMessage(
          validationResult,
          "Të dhënat e biznesit nuk janë të vlefshme.",
        ),
      };
    }

    const {
      name,
      nipt,
      email,
      phone,
      city,
      address,
      website,
      logo,
      workingHours,
      currency,
      vat,
      timezone,
    } = validationResult.data;

    const existingBusiness = await db.business.findFirst({
      where: {
        id: businessId,
      },

      select: {
        id: true,
        isActive: true,
      },
    });

    if (!existingBusiness) {
      return {
        success: false,
        message: "Biznesi nuk u gjet.",
      };
    }

    if (!existingBusiness.isActive) {
      return {
        success: false,
        message: "Biznesi nuk është më aktiv.",
      };
    }

    if (nipt) {
      const businessWithSameNipt = await db.business.findFirst({
        where: {
          nipt,

          id: {
            not: businessId,
          },
        },

        select: {
          id: true,
        },
      });

      if (businessWithSameNipt) {
        return {
          success: false,
          message: "Ky NIPT përdoret tashmë nga një biznes tjetër.",
        };
      }
    }

    const updateResult = await db.business.updateMany({
      where: {
        id: businessId,
        isActive: true,
      },

      data: {
        name,
        nipt,
        email,
        phone,
        city,
        address,
        website,
        logo,
        workingHours,
        currency,
        vat,
        timezone,
      },
    });

    if (updateResult.count !== 1) {
      return {
        success: false,

        message: "Biznesi nuk u gjet ose nuk është më aktiv.",
      };
    }

    revalidateBusinessSettingsPages();

    return {
      success: true,

      message: "Të dhënat e biznesit u përditësuan me sukses.",
    };
  } catch (error) {
    console.error("updateBusinessSettings error:", error);

    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}
