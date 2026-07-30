"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireCustomerActionContext } from "@/lib/customer-context";
import {
  getFieldErrors,
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import {
  customerVehicleIdSchema,
  customerVehicleSchema,
} from "@/schemas/customer-vehicle-schema";

const emptyResult = {
  success: false,
  message: "",
  errors: {},
};

function revalidateCustomerVehiclePages(vehicleId = null) {
  revalidatePath("/customer/vehicles");
  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/services");

  if (vehicleId) {
    revalidatePath(`/customer/vehicles/${vehicleId}`);
    revalidatePath(`/customer/vehicles/${vehicleId}/claim`);
  }
}

function getDuplicatePlateResult({
  message = "Ekziston tashmë një automjet me këtë targë.",
  fieldMessage = "Kjo targë është regjistruar më parë.",
} = {}) {
  return {
    ...emptyResult,
    message,
    errors: {
      plate: fieldMessage,
    },
  };
}

function validateVehicleId(vehicleId) {
  const validationResult = validateObject(customerVehicleIdSchema, vehicleId);

  if (!validationResult.success) {
    return {
      success: false,
      message: getFirstValidationMessage(
        validationResult.error,
        "ID-ja e automjetit mungon.",
      ),
      vehicleId: null,
    };
  }

  return {
    success: true,
    message: null,
    vehicleId: validationResult.data,
  };
}

export async function createCustomerVehicle(previousState, formData) {
  try {
    const { profileId } = await requireCustomerActionContext();

    const validationResult = validateFormData(customerVehicleSchema, formData);

    if (!validationResult.success) {
      return {
        ...emptyResult,
        message: "Kontrollo fushat e formularit.",
        errors: getFieldErrors(validationResult.error),
      };
    }

    const data = validationResult.data;

    const existingVehicle = await db.customerVehicle.findUnique({
      where: {
        profileId_plate: {
          profileId,
          plate: data.plate,
        },
      },

      select: {
        id: true,
      },
    });

    if (existingVehicle) {
      return getDuplicatePlateResult();
    }

    await db.customerVehicle.create({
      data: {
        profileId,
        ...data,
      },
    });

    revalidateCustomerVehiclePages();
  } catch (error) {
    console.error("Gabim gjatë krijimit të automjetit:", error);

    if (error?.code === "P2002") {
      return getDuplicatePlateResult();
    }

    return {
      ...emptyResult,

      message:
        error instanceof Error
          ? error.message
          : "Ndodhi një gabim gjatë krijimit të automjetit.",
    };
  }

  redirect("/customer/vehicles");
}

export async function updateCustomerVehicle(
  vehicleId,
  previousState,
  formData,
) {
  try {
    const { profileId } = await requireCustomerActionContext();

    const vehicleIdResult = validateVehicleId(vehicleId);

    if (!vehicleIdResult.success) {
      return {
        ...emptyResult,
        message: vehicleIdResult.message,
      };
    }

    const validatedVehicleId = vehicleIdResult.vehicleId;

    const currentVehicle = await db.customerVehicle.findFirst({
      where: {
        id: validatedVehicleId,
        profileId,
      },

      select: {
        id: true,
      },
    });

    if (!currentVehicle) {
      return {
        ...emptyResult,

        message: "Automjeti nuk u gjet ose nuk keni leje ta ndryshoni.",
      };
    }

    const validationResult = validateFormData(customerVehicleSchema, formData);

    if (!validationResult.success) {
      return {
        ...emptyResult,
        message: "Kontrollo fushat e formularit.",
        errors: getFieldErrors(validationResult.error),
      };
    }

    const data = validationResult.data;

    const duplicateVehicle = await db.customerVehicle.findFirst({
      where: {
        profileId,
        plate: data.plate,

        NOT: {
          id: validatedVehicleId,
        },
      },

      select: {
        id: true,
      },
    });

    if (duplicateVehicle) {
      return getDuplicatePlateResult({
        message: "Një automjet tjetër përdor këtë targë.",

        fieldMessage: "Kjo targë është regjistruar te një automjet tjetër.",
      });
    }

    await db.customerVehicle.update({
      where: {
        id: validatedVehicleId,
      },

      data,
    });

    revalidateCustomerVehiclePages(validatedVehicleId);

    return {
      success: true,
      message: "Automjeti u përditësua me sukses.",
      errors: {},
    };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të automjetit:", error);

    if (error?.code === "P2002") {
      return getDuplicatePlateResult({
        message: "Një automjet tjetër përdor këtë targë.",

        fieldMessage: "Kjo targë është regjistruar te një automjet tjetër.",
      });
    }

    return {
      ...emptyResult,

      message:
        error instanceof Error
          ? error.message
          : "Ndodhi një gabim gjatë përditësimit të automjetit.",
    };
  }
}

export async function deleteCustomerVehicle(vehicleId) {
  try {
    const { profileId } = await requireCustomerActionContext();

    const vehicleIdResult = validateVehicleId(vehicleId);

    if (!vehicleIdResult.success) {
      return {
        success: false,
        message: vehicleIdResult.message,
      };
    }

    const validatedVehicleId = vehicleIdResult.vehicleId;

    const vehicle = await db.customerVehicle.findFirst({
      where: {
        id: validatedVehicleId,
        profileId,
      },

      select: {
        id: true,
      },
    });

    if (!vehicle) {
      return {
        success: false,

        message: "Automjeti nuk u gjet ose nuk keni leje ta fshini.",
      };
    }

    await db.customerVehicle.delete({
      where: {
        id: validatedVehicleId,
      },
    });

    revalidateCustomerVehiclePages();

    return {
      success: true,
      message: "Automjeti u fshi me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë fshirjes së automjetit:", error);

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Ndodhi një gabim gjatë fshirjes së automjetit.",
    };
  }
}
