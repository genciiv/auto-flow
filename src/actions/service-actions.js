"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import {
  logCreate,
  logDelete,
  logStatusChange,
  logUpdate,
} from "@/services/audit-events";

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

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

function getStatusLabel(status) {
  const labels = {
    PENDING: "Në pritje",
    IN_PROGRESS: "Në proces",
    COMPLETED: "Përfunduar",
    CANCELLED: "Anuluar",
  };

  return labels[status] || status;
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

    const vehicleId = getFormString(formData, "vehicleId");
    const title = getFormString(formData, "title");
    const description = getFormString(formData, "description");
    const status = getFormString(formData, "status") || "PENDING";
    const totalValue = getFormString(formData, "total");

    if (!vehicleId || !title) {
      return {
        success: false,
        message: "Automjeti dhe titulli janë të detyrueshme.",
      };
    }

    if (!VALID_STATUSES.includes(status)) {
      return {
        success: false,
        message: "Statusi i zgjedhur nuk është i vlefshëm.",
      };
    }

    const total = totalValue ? Number(totalValue) : 0;

    if (!Number.isFinite(total) || total < 0) {
      return {
        success: false,
        message: "Totali i shërbimit nuk është i vlefshëm.",
      };
    }

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
          description: description || null,
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

    const id = getFormString(formData, "id");
    const vehicleId = getFormString(formData, "vehicleId");
    const title = getFormString(formData, "title");
    const description = getFormString(formData, "description");
    const status = getFormString(formData, "status");
    const totalValue = getFormString(formData, "total");

    if (!id) {
      return {
        success: false,
        message: "ID e shërbimit mungon.",
      };
    }

    if (!vehicleId || !title) {
      return {
        success: false,
        message: "Automjeti dhe titulli janë të detyrueshme.",
      };
    }

    if (!VALID_STATUSES.includes(status)) {
      return {
        success: false,
        message: "Statusi i zgjedhur nuk është i vlefshëm.",
      };
    }

    const total = totalValue ? Number(totalValue) : 0;

    if (!Number.isFinite(total) || total < 0) {
      return {
        success: false,
        message: "Totali i shërbimit nuk është i vlefshëm.",
      };
    }

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
          description: description || null,
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

      if (existingService.status !== updatedService.status) {
        await logStatusChange({
          context,
          entityType: "SERVICE",
          entityId: updatedService.id,
          title: `Ndryshoi statusi i shërbimit ${updatedService.title}`,
          description: `Statusi ndryshoi nga "${getStatusLabel(
            existingService.status,
          )}" në "${getStatusLabel(updatedService.status)}".`,
          oldStatus: existingService.status,
          newStatus: updatedService.status,
          metadata: {
            source: "service-actions",
            operation: "updateService",
            vehiclePlate: vehicle.plate,
          },
          database: transaction,
        });
      }
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
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_UPDATE,
    );

    const { businessId } = context;

    if (!serviceId || typeof serviceId !== "string") {
      return {
        success: false,
        message: "ID e shërbimit mungon.",
      };
    }

    if (!VALID_STATUSES.includes(status)) {
      return {
        success: false,
        message: "Statusi i zgjedhur nuk është i vlefshëm.",
      };
    }

    const service = await db.serviceRecord.findFirst({
      where: {
        id: serviceId,
        businessId,
      },
      select: {
        id: true,
        title: true,
        status: true,
        vehicle: {
          select: {
            plate: true,
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

    if (service.status === status) {
      return {
        success: true,
        message: "Statusi është tashmë i përditësuar.",
      };
    }

    await db.$transaction(async (transaction) => {
      const updatedService = await transaction.serviceRecord.update({
        where: {
          id: service.id,
        },
        data: {
          status,
        },
        select: {
          id: true,
          title: true,
          status: true,
        },
      });

      await logStatusChange({
        context,
        entityType: "SERVICE",
        entityId: updatedService.id,
        title: `Ndryshoi statusi i shërbimit ${updatedService.title}`,
        description: `Statusi ndryshoi nga "${getStatusLabel(
          service.status,
        )}" në "${getStatusLabel(updatedService.status)}".`,
        oldStatus: service.status,
        newStatus: updatedService.status,
        metadata: {
          source: "service-actions",
          operation: "updateServiceStatus",
          vehiclePlate: service.vehicle?.plate || null,
        },
        database: transaction,
      });
    });

    refreshServicePages(service.id);

    return {
      success: true,
      message: "Statusi u përditësua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë ndryshimit të statusit:", error);

    const permissionMessage = getPermissionErrorMessage(error);

    return {
      success: false,
      message:
        permissionMessage || "Ndodhi një gabim gjatë ndryshimit të statusit.",
    };
  }
}

export async function deleteService(serviceId) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_DELETE,
    );

    const { businessId } = context;

    if (!serviceId || typeof serviceId !== "string") {
      return {
        success: false,
        message: "ID e shërbimit mungon.",
      };
    }

    const service = await db.serviceRecord.findFirst({
      where: {
        id: serviceId,
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
        description: `Shërbimi "${service.title}" për automjetin me targë "${service.vehicle?.plate || "pa targë"}" u fshi nga sistemi.`,
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
