"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireCustomerActionContext } from "@/lib/customer-context";

const emptyResult = {
  success: false,
  message: "",
  errors: {},
};

function cleanText(value) {
  const text = String(value || "").trim();

  return text || null;
}

function normalizePlate(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function parseOptionalInteger(value) {
  const text = String(value || "").trim();

  if (!text) {
    return null;
  }

  const number = Number(text);

  if (!Number.isInteger(number)) {
    return null;
  }

  return number;
}

function getVehicleData(formData) {
  const yearRaw = String(formData.get("year") || "").trim();
  const mileageRaw = String(formData.get("mileage") || "").trim();

  return {
    plate: normalizePlate(formData.get("plate")),
    brand: cleanText(formData.get("brand")),
    model: cleanText(formData.get("model")),
    year: parseOptionalInteger(yearRaw),
    yearRaw,
    fuel: cleanText(formData.get("fuel")),
    engine: cleanText(formData.get("engine")),
    transmission: cleanText(formData.get("transmission")),
    vin: cleanText(formData.get("vin"))?.toUpperCase() || null,
    mileage: parseOptionalInteger(mileageRaw),
    mileageRaw,
    color: cleanText(formData.get("color")),
    notes: cleanText(formData.get("notes")),
  };
}

function validateVehicleData(data) {
  const errors = {};
  const currentYear = new Date().getFullYear();

  if (!data.plate) {
    errors.plate = "Targa është e detyrueshme.";
  } else if (data.plate.length < 3 || data.plate.length > 20) {
    errors.plate = "Targa duhet të ketë nga 3 deri në 20 karaktere.";
  }

  if (!data.brand) {
    errors.brand = "Marka është e detyrueshme.";
  } else if (data.brand.length > 60) {
    errors.brand = "Marka nuk mund të jetë më e gjatë se 60 karaktere.";
  }

  if (data.model && data.model.length > 80) {
    errors.model = "Modeli nuk mund të jetë më i gjatë se 80 karaktere.";
  }

  if (data.yearRaw && data.year === null) {
    errors.year = "Viti duhet të jetë numër i plotë.";
  } else if (
    data.year !== null &&
    (data.year < 1900 || data.year > currentYear + 1)
  ) {
    errors.year = `Viti duhet të jetë ndërmjet 1900 dhe ${currentYear + 1}.`;
  }

  if (data.mileageRaw && data.mileage === null) {
    errors.mileage = "Kilometrat duhet të jenë numër i plotë.";
  } else if (data.mileage !== null && data.mileage < 0) {
    errors.mileage = "Kilometrat nuk mund të jenë negativë.";
  }

  if (data.vin && data.vin.length > 40) {
    errors.vin = "VIN-i nuk mund të jetë më i gjatë se 40 karaktere.";
  }

  if (data.engine && data.engine.length > 50) {
    errors.engine = "Motori nuk mund të jetë më i gjatë se 50 karaktere.";
  }

  if (data.color && data.color.length > 40) {
    errors.color = "Ngjyra nuk mund të jetë më e gjatë se 40 karaktere.";
  }

  if (data.notes && data.notes.length > 1000) {
    errors.notes = "Shënimet nuk mund të jenë më të gjata se 1000 karaktere.";
  }

  return errors;
}

export async function createCustomerVehicle(previousState, formData) {
  try {
    const { profileId } = await requireCustomerActionContext();
    const data = getVehicleData(formData);
    const errors = validateVehicleData(data);

    if (Object.keys(errors).length > 0) {
      return {
        ...emptyResult,
        message: "Kontrollo fushat e formularit.",
        errors,
      };
    }

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
      return {
        ...emptyResult,
        message: "Ekziston tashmë një automjet me këtë targë.",
        errors: {
          plate: "Kjo targë është regjistruar më parë.",
        },
      };
    }

    await db.customerVehicle.create({
      data: {
        profileId,
        plate: data.plate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        fuel: data.fuel,
        engine: data.engine,
        transmission: data.transmission,
        vin: data.vin,
        mileage: data.mileage,
        color: data.color,
        notes: data.notes,
      },
    });

    revalidatePath("/customer/vehicles");
    revalidatePath("/customer/dashboard");
  } catch (error) {
    console.error("Gabim gjatë krijimit të automjetit:", error);

    if (error?.code === "P2002") {
      return {
        ...emptyResult,
        message: "Ekziston tashmë një automjet me këtë targë.",
        errors: {
          plate: "Kjo targë është regjistruar më parë.",
        },
      };
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

    const currentVehicle = await db.customerVehicle.findFirst({
      where: {
        id: vehicleId,
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

    const data = getVehicleData(formData);
    const errors = validateVehicleData(data);

    if (Object.keys(errors).length > 0) {
      return {
        ...emptyResult,
        message: "Kontrollo fushat e formularit.",
        errors,
      };
    }

    const duplicateVehicle = await db.customerVehicle.findFirst({
      where: {
        profileId,
        plate: data.plate,
        NOT: {
          id: vehicleId,
        },
      },

      select: {
        id: true,
      },
    });

    if (duplicateVehicle) {
      return {
        ...emptyResult,
        message: "Një automjet tjetër përdor këtë targë.",
        errors: {
          plate: "Kjo targë është regjistruar te një automjet tjetër.",
        },
      };
    }

    await db.customerVehicle.update({
      where: {
        id: vehicleId,
      },

      data: {
        plate: data.plate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        fuel: data.fuel,
        engine: data.engine,
        transmission: data.transmission,
        vin: data.vin,
        mileage: data.mileage,
        color: data.color,
        notes: data.notes,
      },
    });

    revalidatePath("/customer/vehicles");
    revalidatePath(`/customer/vehicles/${vehicleId}`);
    revalidatePath("/customer/dashboard");

    return {
      success: true,
      message: "Automjeti u përditësua me sukses.",
      errors: {},
    };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të automjetit:", error);

    if (error?.code === "P2002") {
      return {
        ...emptyResult,
        message: "Një automjet tjetër përdor këtë targë.",
        errors: {
          plate: "Kjo targë është regjistruar te një automjet tjetër.",
        },
      };
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

    const vehicle = await db.customerVehicle.findFirst({
      where: {
        id: vehicleId,
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
        id: vehicleId,
      },
    });

    revalidatePath("/customer/vehicles");
    revalidatePath("/customer/dashboard");

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
