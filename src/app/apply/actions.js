"use server";

import { createBusinessApplication } from "@/services/application-service";

const initialErrorState = {
  success: false,
  message: "",
  fieldErrors: {},
};

function readRequiredString(formData, fieldName) {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function validateApplication({ businessName, ownerName, email, phone, city }) {
  const fieldErrors = {};

  if (businessName.length < 2) {
    fieldErrors.businessName = "Vendos emrin e biznesit.";
  }

  if (ownerName.length < 2) {
    fieldErrors.ownerName = "Vendos emrin e pronarit.";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Vendos një adresë emaili të vlefshme.";
  }

  if (phone.length < 6) {
    fieldErrors.phone = "Vendos një numër telefoni të vlefshëm.";
  }

  if (city.length < 2) {
    fieldErrors.city = "Vendos qytetin.";
  }

  return fieldErrors;
}

export async function submitBusinessApplicationAction(previousState, formData) {
  const businessName = readRequiredString(formData, "businessName");

  const ownerName = readRequiredString(formData, "ownerName");

  const email = readRequiredString(formData, "email").toLowerCase();

  const phone = readRequiredString(formData, "phone");

  const city = readRequiredString(formData, "city");

  const address = readRequiredString(formData, "address");

  const notes = readRequiredString(formData, "notes");

  const fieldErrors = validateApplication({
    businessName,
    ownerName,
    email,
    phone,
    city,
  });

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ...initialErrorState,
      fieldErrors,
      message: "Kontrollo fushat e formularit.",
    };
  }

  try {
    await createBusinessApplication({
      businessName,
      ownerName,
      email,
      phone,
      city,
      address,
      notes,
    });

    return {
      success: true,
      message:
        "Aplikimi u dërgua me sukses. Ekipi i AutoFlow do ta shqyrtojë së shpejti.",
      fieldErrors: {},
    };
  } catch (error) {
    console.error("Business application error:", error);

    return {
      ...initialErrorState,
      message:
        error instanceof Error
          ? error.message
          : "Aplikimi nuk mund të dërgohej.",
    };
  }
}
