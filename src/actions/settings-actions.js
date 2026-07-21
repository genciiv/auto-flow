"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessActionPermission } from "@/lib/business-context";

function getTextValue(formData, fieldName) {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getOptionalTextValue(formData, fieldName) {
  const value = getTextValue(formData, fieldName);

  return value || null;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidWebsite(value) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

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

export async function updateProfileSettings(formData) {
  try {
    const { userId } = await requireBusinessActionPermission(
      PERMISSIONS.SETTINGS_UPDATE,
    );

    const name = getTextValue(formData, "name");
    const email = getTextValue(formData, "email").toLowerCase();
    const phone = getOptionalTextValue(formData, "phone");

    if (name.length < 2) {
      return {
        success: false,
        message: "Emri duhet të ketë të paktën 2 karaktere.",
      };
    }

    if (name.length > 100) {
      return {
        success: false,
        message: "Emri nuk mund të ketë më shumë se 100 karaktere.",
      };
    }

    if (!email || !isValidEmail(email)) {
      return {
        success: false,
        message: "Vendos një adresë email-i të vlefshme.",
      };
    }

    if (email.length > 190) {
      return {
        success: false,
        message: "Email-i është shumë i gjatë.",
      };
    }

    if (phone && phone.length > 30) {
      return {
        success: false,
        message: "Numri i telefonit është shumë i gjatë.",
      };
    }

    const existingUser = await db.user.findFirst({
      where: {
        email,
        id: {
          not: userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Ky email përdoret tashmë nga një llogari tjetër.",
      };
    }

    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        email,
        phone,
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard", "layout");

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

    const name = getTextValue(formData, "name");
    const niptValue = getTextValue(formData, "nipt").toUpperCase();
    const nipt = niptValue || null;

    const emailValue = getTextValue(formData, "email").toLowerCase();
    const email = emailValue || null;

    const phone = getOptionalTextValue(formData, "phone");
    const city = getOptionalTextValue(formData, "city");
    const address = getOptionalTextValue(formData, "address");
    const website = getOptionalTextValue(formData, "website");
    const logo = getOptionalTextValue(formData, "logo");
    const workingHours = getOptionalTextValue(formData, "workingHours");

    const currency = getTextValue(formData, "currency") || "ALL";
    const timezone = getTextValue(formData, "timezone") || "Europe/Tirane";

    const vatInput = getTextValue(formData, "vat");
    const vat = vatInput === "" ? 20 : Number(vatInput);

    const allowedCurrencies = ["ALL", "EUR", "USD"];
    const allowedTimezones = [
      "Europe/Tirane",
      "Europe/Rome",
      "Europe/Berlin",
      "Europe/London",
    ];

    if (name.length < 2) {
      return {
        success: false,
        message: "Emri i biznesit duhet të ketë të paktën 2 karaktere.",
      };
    }

    if (name.length > 150) {
      return {
        success: false,
        message: "Emri i biznesit është shumë i gjatë.",
      };
    }

    if (email && !isValidEmail(email)) {
      return {
        success: false,
        message: "Vendos një email biznesi të vlefshëm.",
      };
    }

    if (website && !isValidWebsite(website)) {
      return {
        success: false,
        message:
          "Website duhet të fillojë me http:// ose https:// dhe të jetë i vlefshëm.",
      };
    }

    if (logo && !isValidWebsite(logo)) {
      return {
        success: false,
        message: "Linku i logos duhet të fillojë me http:// ose https://.",
      };
    }

    if (nipt && nipt.length > 30) {
      return {
        success: false,
        message: "NIPT-i nuk mund të ketë më shumë se 30 karaktere.",
      };
    }

    if (phone && phone.length > 30) {
      return {
        success: false,
        message: "Numri i telefonit është shumë i gjatë.",
      };
    }

    if (!Number.isFinite(vat) || vat < 0 || vat > 100) {
      return {
        success: false,
        message: "TVSH-ja duhet të jetë një numër nga 0 deri në 100.",
      };
    }

    if (!allowedCurrencies.includes(currency)) {
      return {
        success: false,
        message: "Monedha e zgjedhur nuk është e vlefshme.",
      };
    }

    if (!allowedTimezones.includes(timezone)) {
      return {
        success: false,
        message: "Zona kohore e zgjedhur nuk është e vlefshme.",
      };
    }

    if (nipt) {
      const existingBusiness = await db.business.findFirst({
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

      if (existingBusiness) {
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

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");

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
