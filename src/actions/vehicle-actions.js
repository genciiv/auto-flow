"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import {
  createVehicleSchema,
  deleteVehicleSchema,
  updateVehicleSchema,
} from "@/schemas/vehicle-schema";
import { logCreate, logDelete, logUpdate } from "@/services/audit-events";
import { assertPlanLimit, PLAN_RESOURCES } from "@/services/plan-access-service";

function getPermissionErrorMessage(error) {
  if (
    error instanceof Error &&
    error.message === "Nuk keni leje për të kryer këtë veprim."
  ) {
    return error.message;
  }

  return null;
}

function getVehicleAuditValues(vehicle) {
  if (!vehicle) {
    return null;
  }

  return {
    id: vehicle.id,
    customerId: vehicle.customerId,
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    vin: vehicle.vin,
  };
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
    const context = await requireBusinessActionPermission(
      PERMISSIONS.VEHICLES_CREATE,
    );

    const { businessId } = context;

    const validationResult = validateFormData(createVehicleSchema, formData);

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Të dhënat e automjetit nuk janë të vlefshme.",
        ),
      };
    }

    const { customerId, plate, brand, model, year, vin } =
      validationResult.data;

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

    await db.$transaction(async (transaction) => {
      await assertPlanLimit(businessId, PLAN_RESOURCES.VEHICLES, {
        database: transaction,
      });

      const vehicle = await transaction.vehicle.create({
        data: {
          businessId,
          customerId: customerValidation.customerId,
          plate,
          brand,
          model,
          year,
          vin,
        },

        select: {
          id: true,
          customerId: true,
          plate: true,
          brand: true,
          model: true,
          year: true,
          vin: true,
        },
      });

      await logCreate({
        context,
        entityType: "VEHICLE",
        entityId: vehicle.id,
        title: `U krijua automjeti ${vehicle.plate}`,
        description: `Automjeti "${vehicle.brand} ${
          vehicle.model || ""
        }" me targë "${vehicle.plate}" u regjistrua në sistem.`,
        newValues: getVehicleAuditValues(vehicle),

        metadata: {
          source: "vehicle-actions",
          operation: "createVehicle",
        },

        database: transaction,
      });
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
    const context = await requireBusinessActionPermission(
      PERMISSIONS.VEHICLES_UPDATE,
    );

    const { businessId } = context;

    const validationResult = validateFormData(updateVehicleSchema, formData);

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Të dhënat e automjetit nuk janë të vlefshme.",
        ),
      };
    }

    const { id, customerId, plate, brand, model, year, vin } =
      validationResult.data;

    const vehicle = await db.vehicle.findFirst({
      where: {
        id,
        businessId,
      },

      select: {
        id: true,
        customerId: true,
        plate: true,
        brand: true,
        model: true,
        year: true,
        vin: true,
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

    await db.$transaction(async (transaction) => {
      const updatedVehicle = await transaction.vehicle.update({
        where: {
          id: vehicle.id,
        },

        data: {
          customerId: customerValidation.customerId,
          plate,
          brand,
          model,
          year,
          vin,
        },

        select: {
          id: true,
          customerId: true,
          plate: true,
          brand: true,
          model: true,
          year: true,
          vin: true,
        },
      });

      await logUpdate({
        context,
        entityType: "VEHICLE",
        entityId: updatedVehicle.id,
        title: `U përditësua automjeti ${updatedVehicle.plate}`,
        description: `Të dhënat e automjetit me targë "${updatedVehicle.plate}" u përditësuan.`,
        oldValues: getVehicleAuditValues(vehicle),
        newValues: getVehicleAuditValues(updatedVehicle),

        metadata: {
          source: "vehicle-actions",
          operation: "updateVehicle",
        },

        database: transaction,
      });
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
    const context = await requireBusinessActionPermission(
      PERMISSIONS.VEHICLES_DELETE,
    );

    const { businessId } = context;

    const validationResult = validateObject(deleteVehicleSchema, {
      vehicleId,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "ID e automjetit mungon.",
        ),
      };
    }

    const validatedVehicleId = validationResult.data.vehicleId;

    const vehicle = await db.vehicle.findFirst({
      where: {
        id: validatedVehicleId,
        businessId,
      },

      select: {
        id: true,
        customerId: true,
        plate: true,
        brand: true,
        model: true,
        year: true,
        vin: true,
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

    await db.$transaction(async (transaction) => {
      await transaction.vehicle.delete({
        where: {
          id: vehicle.id,
        },
      });

      await logDelete({
        context,
        entityType: "VEHICLE",
        entityId: vehicle.id,
        title: `U fshi automjeti ${vehicle.plate}`,
        description: `Automjeti "${vehicle.brand} ${
          vehicle.model || ""
        }" me targë "${vehicle.plate}" u fshi nga sistemi.`,
        oldValues: getVehicleAuditValues(vehicle),

        metadata: {
          source: "vehicle-actions",
          operation: "deleteVehicle",
        },

        database: transaction,
      });
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
