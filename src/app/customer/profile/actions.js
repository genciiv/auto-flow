"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireCustomerActionContext } from "@/lib/customer-context";

const initialResult = {
  success: false,
  message: "",
  errors: {},
};

function cleanText(value) {
  const text = String(value || "").trim();

  return text || null;
}

function parseBirthDate(value) {
  const text = String(value || "").trim();

  if (!text) {
    return null;
  }

  const date = new Date(`${text}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function validateProfileData(data) {
  const errors = {};

  if (!data.firstName) {
    errors.firstName = "Emri është i detyrueshëm.";
  }

  if (!data.lastName) {
    errors.lastName = "Mbiemri është i detyrueshëm.";
  }

  if (data.firstName && data.firstName.length > 60) {
    errors.firstName = "Emri nuk mund të jetë më i gjatë se 60 karaktere.";
  }

  if (data.lastName && data.lastName.length > 60) {
    errors.lastName = "Mbiemri nuk mund të jetë më i gjatë se 60 karaktere.";
  }

  if (data.phone && data.phone.length > 30) {
    errors.phone = "Numri i telefonit është shumë i gjatë.";
  }

  if (data.city && data.city.length > 80) {
    errors.city = "Emri i qytetit është shumë i gjatë.";
  }

  if (data.address && data.address.length > 200) {
    errors.address = "Adresa nuk mund të jetë më e gjatë se 200 karaktere.";
  }

  if (data.birthDateRaw && !data.birthDate) {
    errors.birthDate = "Datëlindja nuk është e vlefshme.";
  }

  if (data.birthDate && data.birthDate > new Date()) {
    errors.birthDate = "Datëlindja nuk mund të jetë në të ardhmen.";
  }

  return errors;
}

export async function updateCustomerProfile(previousState, formData) {
  try {
    const { userId, profileId } = await requireCustomerActionContext();

    const firstName = cleanText(formData.get("firstName"));
    const lastName = cleanText(formData.get("lastName"));
    const phone = cleanText(formData.get("phone"));
    const city = cleanText(formData.get("city"));
    const address = cleanText(formData.get("address"));
    const birthDateRaw = String(formData.get("birthDate") || "").trim();
    const birthDate = parseBirthDate(birthDateRaw);

    const data = {
      firstName,
      lastName,
      phone,
      city,
      address,
      birthDate,
      birthDateRaw,
    };

    const errors = validateProfileData(data);

    if (Object.keys(errors).length > 0) {
      return {
        ...initialResult,
        errors,
        message: "Kontrollo fushat e formularit.",
      };
    }

    const fullName = `${firstName} ${lastName}`.trim();

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

    revalidatePath("/customer/profile");
    revalidatePath("/customer/dashboard");
    revalidatePath("/customer", "layout");

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
