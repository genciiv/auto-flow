"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireCustomerActionContext } from "@/lib/customer-context";
import {
  getFieldErrors,
  getFirstValidationMessage,
  validateFormData,
} from "@/lib/validation";
import { customerProfileSchema } from "@/schemas/customer-profile-schema";

const initialResult = {
  success: false,
  message: "",
  errors: {},
};

function revalidateCustomerProfilePages() {
  revalidatePath("/customer/profile");
  revalidatePath("/customer/dashboard");
  revalidatePath("/customer", "layout");
}

export async function updateCustomerProfile(previousState, formData) {
  try {
    const { userId, profileId } = await requireCustomerActionContext();

    const validationResult = validateFormData(customerProfileSchema, formData);

    if (!validationResult.success) {
      return {
        ...initialResult,

        message: getFirstValidationMessage(
          validationResult.error,
          "Kontrollo fushat e formularit.",
        ),

        errors: getFieldErrors(validationResult.error),
      };
    }

    const { firstName, lastName, phone, city, address, birthDate } =
      validationResult.data;

    const fullName = `${firstName} ${lastName}`.trim();

    const [existingProfile, existingUser] = await Promise.all([
      db.customerProfile.findUnique({
        where: {
          id: profileId,
        },

        select: {
          id: true,
        },
      }),

      db.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          isActive: true,
        },
      }),
    ]);

    if (!existingProfile) {
      return {
        ...initialResult,
        message: "Profili i klientit nuk u gjet.",
      };
    }

    if (!existingUser || !existingUser.isActive) {
      return {
        ...initialResult,
        message: "Llogaria nuk u gjet ose është çaktivizuar.",
      };
    }

    await db.$transaction([
      db.customerProfile.update({
        where: {
          id: profileId,
        },

        data: {
          firstName,
          lastName,
          phone,
          city,
          address,
          birthDate,
        },
      }),

      db.user.update({
        where: {
          id: userId,
        },

        data: {
          name: fullName,
          phone,
        },
      }),
    ]);

    revalidateCustomerProfilePages();

    return {
      success: true,
      message: "Profili u përditësua me sukses.",
      errors: {},
    };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të profilit:", error);

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Ndodhi një gabim gjatë ruajtjes së profilit.",

      errors: {},
    };
  }
}
