"use server";

import { validateFormData } from "@/lib/validation";
import { businessApplicationSchema } from "@/schemas/application-schema";
import { getPlatformSettings } from "@/services/admin/settings-service";
import { createBusinessApplication } from "@/services/application-service";

const initialErrorState = {
  success: false,
  message: "",
  fieldErrors: {},
};

export async function submitBusinessApplicationAction(previousState, formData) {
  /*
   * Kontrolli i platformës qëndron përpara validimit,
   * njësoj si në rrjedhën ekzistuese.
   */
  const settings = await getPlatformSettings();

  if (!settings.allowRegistrations) {
    return {
      ...initialErrorState,
      message:
        "Aplikimet e reja janë mbyllur përkohësisht. Kontakto administratorin e AutoFlow.",
    };
  }

  const validationResult = validateFormData(
    businessApplicationSchema,
    formData,
  );

  if (!validationResult.success) {
    return {
      ...initialErrorState,
      fieldErrors: validationResult.fieldErrors,
      message: "Kontrollo fushat e formularit.",
    };
  }

  const { businessName, ownerName, email, phone, city, address, notes } =
    validationResult.data;

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
