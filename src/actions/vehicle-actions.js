"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

function getFormString(formData, fieldName) {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getPermissionErrorMessage(error) {
  if (
    error instanceof Error &&
    error.message === "Nuk keni leje për të kryer këtë veprim."
  ) {
    return error.message;
  }

  return null;
}

async function validateCustomerOwnership(customerId, businessId) {
  if (!customerId) {
    return {
      valid: true,
      customerId: null,
    };
  }

  const customer = await db.customer.findFirst({
    where: {
      id: customerId,
      businessId,
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    return {
      valid: false,
      customerId: null,
    };
  }

  return {
    valid: true,
    customerId: customer.id,
  };
}

export async function createVehicle(formData) {
  try {
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.VEHICLES_CREATE,
    );

    const customerId = getFormString(formData, "customerId");
    const plate = getFormString(formData, "plate").toUpperCase();
    const brand = getFormString(formData, "brand");
    const model = getFormString(formData, "model");
    const yearValue = getFormString(formData, "year");
    const vin = getFormString(formData, "vin").toUpperCase();

    if (!plate || !brand) {
      return {
        success: false,
        message: "Targa dhe marka janë të detyrueshme.",
      };
    }

    const year = yearValue ? Number(yearValue) : null;

    if (
      year !== null &&
      (!Number.isInteger(year) || year < 1900 || year > 2100)
    ) {
      return {
        success: false,
        message: "Viti i automjetit nuk është i vlefshëm.",
      };
    }

    const customerValidation = await validateCustomerOwnership(
      customerId,
      businessId,
    );

    if (!customerValidation.valid) {
      return {
        success: false,
        message: "Klienti i zgjedhur nuk u gjet në biznesin aktiv.",
      };
    }

    const existingPlate = await db.vehicle.findFirst({
      where: {
        businessId,
        plate,
      },
      select: {
        id: true,
      },
    });

    if (existingPlate) {
      return {
        success: false,
        message: "Ekziston një automjet me këtë targë.",
      };
    }

    if (vin) {
      const existingVin = await db.vehicle.findFirst({
        where: {
          businessId,
          vin,
        },
        select: {
          id: true,
        },
      });

      if (existingVin) {
        return {
          success: false,
          message: "Ekziston një automjet me këtë VIN.",
        };
      }
    }

    await db.vehicle.create({
      data: {
        businessId,
        customerId: customerValidation.customerId,
        plate,
        brand,
        model: model || null,
        year,
        vin: vin || null,
      },
    });

    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Automjeti u krijua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë krijimit të automjetit:", error);

    const permissionMessage = getPermissionErrorMessage(error);

    return {
      success: false,
      message:
        permissionMessage || "Ndodhi një gabim gjatë krijimit të automjetit.",
    };
  }
}

export async function updateVehicle(formData) {
  try {
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.VEHICLES_UPDATE,
    );

    const id = getFormString(formData, "id");
    const customerId = getFormString(formData, "customerId");
    const plate = getFormString(formData, "plate").toUpperCase();
    const brand = getFormString(formData, "brand");
    const model = getFormString(formData, "model");
    const yearValue = getFormString(formData, "year");
    const vin = getFormString(formData, "vin").toUpperCase();

    if (!id) {
      return {
        success: false,
        message: "ID e automjetit mungon.",
      };
    }

    if (!plate || !brand) {
      return {
        success: false,
        message: "Targa dhe marka janë të detyrueshme.",
      };
    }

    const year = yearValue ? Number(yearValue) : null;

    if (
      year !== null &&
      (!Number.isInteger(year) || year < 1900 || year > 2100)
    ) {
      return {
        success: false,
        message: "Viti i automjetit nuk është i vlefshëm.",
      };
    }

    const vehicle = await db.vehicle.findFirst({
      where: {
        id,
        businessId,
      },
      select: {
        id: true,
      },
    });

    if (!vehicle) {
      return {
        success: false,
        message: "Automjeti nuk u gjet.",
      };
    }

    const customerValidation = await validateCustomerOwnership(
      customerId,
      businessId,
    );

    if (!customerValidation.valid) {
      return {
        success: false,
        message: "Klienti i zgjedhur nuk u gjet në biznesin aktiv.",
      };
    }

    const existingPlate = await db.vehicle.findFirst({
      where: {
        businessId,
        plate,
        NOT: {
          id: vehicle.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingPlate) {
      return {
        success: false,
        message: "Ekziston një automjet tjetër me këtë targë.",
      };
    }

    if (vin) {
      const existingVin = await db.vehicle.findFirst({
        where: {
          businessId,
          vin,
          NOT: {
            id: vehicle.id,
          },
        },
        select: {
          id: true,
        },
      });

      if (existingVin) {
        return {
          success: false,
          message: "Ekziston një automjet tjetër me këtë VIN.",
        };
      }
    }

    await db.vehicle.update({
      where: {
        id: vehicle.id,
      },
      data: {
        customerId: customerValidation.customerId,
        plate,
        brand,
        model: model || null,
        year,
        vin: vin || null,
      },
    });

    revalidatePath("/dashboard/vehicles");
    revalidatePath(`/dashboard/vehicles/${vehicle.id}`);
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Automjeti u përditësua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të automjetit:", error);

    const permissionMessage = getPermissionErrorMessage(error);

    return {
      success: false,
      message:
        permissionMessage ||
        "Ndodhi një gabim gjatë përditësimit të automjetit.",
    };
  }
}

export async function deleteVehicle(vehicleId) {
  try {
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.VEHICLES_DELETE,
    );

    if (!vehicleId || typeof vehicleId !== "string") {
      return {
        success: false,
        message: "ID e automjetit mungon.",
      };
    }

    const vehicle = await db.vehicle.findFirst({
      where: {
        id: vehicleId,
        businessId,
      },
      select: {
        id: true,
        plate: true,
      },
    });

    if (!vehicle) {
      return {
        success: false,
        message: "Automjeti nuk u gjet.",
      };
    }

    const [serviceCount, appointmentCount] = await Promise.all([
      db.serviceRecord.count({
        where: {
          businessId,
          vehicleId: vehicle.id,
        },
      }),

      db.appointment.count({
        where: {
          businessId,
          vehicleId: vehicle.id,
        },
      }),
    ]);

    if (serviceCount > 0) {
      return {
        success: false,
        message:
          "Automjeti nuk mund të fshihet sepse ka shërbime të regjistruara.",
      };
    }

    if (appointmentCount > 0) {
      return {
        success: false,
        message:
          "Automjeti nuk mund të fshihet sepse ka termine të regjistruara.",
      };
    }

    await db.vehicle.delete({
      where: {
        id: vehicle.id,
      },
    });

    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Automjeti u fshi me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë fshirjes së automjetit:", error);

    const permissionMessage = getPermissionErrorMessage(error);

    return {
      success: false,
      message:
        permissionMessage ||
        "Automjeti nuk mund të fshihet sepse është i lidhur me të dhëna të tjera.",
    };
  }
}
