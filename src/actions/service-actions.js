"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

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
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_CREATE,
    );

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
      },
    });

    if (!vehicle) {
      return {
        success: false,
        message: "Automjeti nuk u gjet në biznesin aktiv.",
      };
    }

    const service = await db.serviceRecord.create({
      data: {
        businessId,
        vehicleId: vehicle.id,
        customerId: vehicle.customerId || null,
        title,
        description: description || null,
        status,
        total,
      },
    });

    refreshServicePages(service.id);

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
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_UPDATE,
    );

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

    await db.serviceRecord.update({
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
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_UPDATE,
    );

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
      },
    });

    if (!service) {
      return {
        success: false,
        message: "Shërbimi nuk u gjet.",
      };
    }

    await db.serviceRecord.update({
      where: {
        id: service.id,
      },
      data: {
        status,
      },
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
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_DELETE,
    );

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

    await db.serviceRecord.delete({
      where: {
        id: service.id,
      },
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
