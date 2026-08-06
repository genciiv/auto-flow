"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import { transitionServiceAction } from "@/actions/service-workflow-actions";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import {
  createServiceSchema,
  deleteServiceSchema,
  updateServiceSchema,
} from "@/schemas/service-schema";
import {
  logCreate,
  logDelete,
  logUpdate,
} from "@/services/audit-events";

function getPermissionErrorMessage(error) {
  if (
    error instanceof Error &&
    error.message === "Nuk keni leje për të kryer këtë veprim."
  ) {
    return error.message;
  }

  return null;
}

function getServiceAuditValues(service) {
  if (!service) {
    return null;
  }

  return {
    id: service.id,
    vehicleId: service.vehicleId,
    customerId: service.customerId,
    title: service.title,
    description: service.description,
    status: service.status,
    total: service.total,
  };
}

function refreshServicePages(serviceId) {
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/vehicles");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");

  if (serviceId) {
    revalidatePath(`/dashboard/services/${serviceId}`);
  }
}

export async function createService(formData) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_CREATE,
    );

    const { businessId } = context;

    const validationResult = validateFormData(createServiceSchema, formData);

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Të dhënat e shërbimit nuk janë të vlefshme.",
        ),
      };
    }

    const { vehicleId, title, description, status, total } =
      validationResult.data;

    const vehicle = await db.vehicle.findFirst({
      where: {
        id: vehicleId,
        businessId,
      },

      select: {
        id: true,
        customerId: true,
        plate: true,
        brand: true,
        model: true,
      },
    });

    if (!vehicle) {
      return {
        success: false,
        message: "Automjeti nuk u gjet në biznesin aktiv.",
      };
    }

    let createdServiceId = null;

    await db.$transaction(async (transaction) => {
      const service = await transaction.serviceRecord.create({
        data: {
          businessId,
          vehicleId: vehicle.id,
          customerId: vehicle.customerId || null,
          title,
          description,
          status,
          total,
        },

        select: {
          id: true,
          vehicleId: true,
          customerId: true,
          title: true,
          description: true,
          status: true,
          total: true,
        },
      });

      createdServiceId = service.id;

      await logCreate({
        context,
        entityType: "SERVICE",
        entityId: service.id,
        title: `U krijua shërbimi ${service.title}`,
        description: `Shërbimi "${service.title}" u krijua për automjetin me targë "${vehicle.plate}".`,
        newValues: getServiceAuditValues(service),

        metadata: {
          source: "service-actions",
          operation: "createService",
          vehiclePlate: vehicle.plate,
          vehicleBrand: vehicle.brand,
          vehicleModel: vehicle.model,
        },

        database: transaction,
      });
    });

    refreshServicePages(createdServiceId);

    return {
      success: true,
      message: "Shërbimi u krijua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë krijimit të shërbimit:", error);

    const permissionMessage = getPermissionErrorMessage(error);

    return {
      success: false,
      message:
        permissionMessage || "Ndodhi një gabim gjatë krijimit të shërbimit.",
    };
  }
}

export async function updateService(formData) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_UPDATE,
    );

    const { businessId } = context;

    const validationResult = validateFormData(updateServiceSchema, formData);

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Të dhënat e shërbimit nuk janë të vlefshme.",
        ),
      };
    }

    const { id, vehicleId, title, description, total } =
      validationResult.data;

    const [existingService, vehicle] = await Promise.all([
      db.serviceRecord.findFirst({
        where: {
          id,
          businessId,
        },

        select: {
          id: true,
          vehicleId: true,
          customerId: true,
          title: true,
          description: true,
          status: true,
          total: true,
        },
      }),

      db.vehicle.findFirst({
        where: {
          id: vehicleId,
          businessId,
        },

        select: {
          id: true,
          customerId: true,
          plate: true,
          brand: true,
          model: true,
        },
      }),
    ]);

    if (!existingService) {
      return {
        success: false,
        message: "Shërbimi nuk u gjet.",
      };
    }

    if (!vehicle) {
      return {
        success: false,
        message: "Automjeti nuk u gjet në biznesin aktiv.",
      };
    }

    await db.$transaction(async (transaction) => {
      const updatedService = await transaction.serviceRecord.update({
        where: {
          id: existingService.id,
        },

        data: {
          vehicleId: vehicle.id,
          customerId: vehicle.customerId || null,
          title,
          description,
          status: existingService.status,
          total,
        },

        select: {
          id: true,
          vehicleId: true,
          customerId: true,
          title: true,
          description: true,
          status: true,
          total: true,
        },
      });

      await logUpdate({
        context,
        entityType: "SERVICE",
        entityId: updatedService.id,
        title: `U përditësua shërbimi ${updatedService.title}`,
        description: `Të dhënat e shërbimit "${updatedService.title}" u përditësuan.`,
        oldValues: getServiceAuditValues(existingService),
        newValues: getServiceAuditValues(updatedService),

        metadata: {
          source: "service-actions",
          operation: "updateService",
          vehiclePlate: vehicle.plate,
        },

        database: transaction,
      });
    });

    refreshServicePages(existingService.id);

    return {
      success: true,
      message: "Shërbimi u përditësua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të shërbimit:", error);

    const permissionMessage = getPermissionErrorMessage(error);

    return {
      success: false,
      message:
        permissionMessage ||
        "Ndodhi një gabim gjatë përditësimit të shërbimit.",
    };
  }
}

export async function updateServiceStatus(serviceId, status) {
  return transitionServiceAction(serviceId, status);
}

export async function deleteService(serviceId) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_DELETE,
    );

    const { businessId } = context;

    const validationResult = validateObject(deleteServiceSchema, {
      serviceId,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "ID e shërbimit mungon.",
        ),
      };
    }

    const validatedServiceId = validationResult.data.serviceId;

    const service = await db.serviceRecord.findFirst({
      where: {
        id: validatedServiceId,
        businessId,
      },

      select: {
        id: true,
        vehicleId: true,
        customerId: true,
        title: true,
        description: true,
        status: true,
        total: true,

        vehicle: {
          select: {
            plate: true,
            brand: true,
            model: true,
          },
        },

        _count: {
          select: {
            partsUsed: true,
          },
        },

        invoice: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!service) {
      return {
        success: false,
        message: "Shërbimi nuk u gjet.",
      };
    }

    if (service._count.partsUsed > 0) {
      return {
        success: false,
        message:
          "Shërbimi nuk mund të fshihet sepse ka pjesë të përdorura. Hiqi fillimisht pjesët nga shërbimi.",
      };
    }

    if (service.invoice) {
      return {
        success: false,
        message: "Shërbimi nuk mund të fshihet sepse ka një faturë të lidhur.",
      };
    }

    await db.$transaction(async (transaction) => {
      await transaction.serviceRecord.delete({
        where: {
          id: service.id,
        },
      });

      await logDelete({
        context,
        entityType: "SERVICE",
        entityId: service.id,
        title: `U fshi shërbimi ${service.title}`,
        description: `Shërbimi "${service.title}" për automjetin me targë "${
          service.vehicle?.plate || "pa targë"
        }" u fshi nga sistemi.`,
        oldValues: getServiceAuditValues(service),

        metadata: {
          source: "service-actions",
          operation: "deleteService",
          vehiclePlate: service.vehicle?.plate || null,
          vehicleBrand: service.vehicle?.brand || null,
          vehicleModel: service.vehicle?.model || null,
        },

        database: transaction,
      });
    });

    refreshServicePages();

    return {
      success: true,
      message: "Shërbimi u fshi me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë fshirjes së shërbimit:", error);

    const permissionMessage = getPermissionErrorMessage(error);

    return {
      success: false,
      message:
        permissionMessage ||
        "Shërbimi nuk mund të fshihet sepse është i lidhur me të dhëna të tjera.",
    };
  }
}
