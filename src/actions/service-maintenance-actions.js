"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";
import {
  calculateMaintenanceStatus,
  getMaintenanceTypeLabel,
  MAINTENANCE_TYPES,
} from "@/lib/maintenance";

const VALID_TYPES = new Set(MAINTENANCE_TYPES.map((item) => item.value));

function optionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed);
}

function optionalDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function normalizeMaintenanceItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item?.enabled)
    .map((item) => {
      const type = String(item?.type || "").trim();
      const lastMileage = optionalNumber(item?.lastMileage);
      const intervalKm = optionalNumber(item?.intervalKm);
      const manualNextMileage = optionalNumber(item?.nextMileage);
      const lastDate = optionalDate(item?.lastDate);
      const nextDate = optionalDate(item?.nextDate);

      const nextMileage =
        manualNextMileage ??
        (lastMileage !== null && intervalKm !== null
          ? lastMileage + intervalKm
          : null);

      return {
        type,
        title:
          String(item?.title || "").trim() || getMaintenanceTypeLabel(type),
        lastMileage,
        intervalKm,
        nextMileage,
        lastDate,
        nextDate,
        notes: String(item?.notes || "").trim() || null,
        status: calculateMaintenanceStatus({
          currentMileage: lastMileage,
          nextMileage,
          nextDate,
        }),
      };
    });
}

function validateMaintenanceItems(items) {
  for (const item of items) {
    if (!VALID_TYPES.has(item.type)) {
      return "Një nga llojet e mirëmbajtjes nuk është i vlefshëm.";
    }

    if (!item.title || item.title.length < 2) {
      return "Çdo mirëmbajtje duhet të ketë një titull.";
    }

    if (
      item.lastMileage === null &&
      item.nextMileage === null &&
      item.lastDate === null &&
      item.nextDate === null
    ) {
      return "Vendos kilometrat ose datën për çdo mirëmbajtje të zgjedhur.";
    }
  }

  return null;
}

function revalidateServiceCompletion(serviceId, vehicleId) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/services");
  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/dashboard/maintenance");
  revalidatePath(`/dashboard/vehicles/${vehicleId}`);
  revalidatePath("/customer/services");
  revalidatePath("/customer/vehicles");
}

export async function completeServiceWithMaintenance(serviceId, items) {
  try {
    const { businessId } = await requireBusinessContext();

    const service = await db.serviceRecord.findFirst({
      where: {
        id: serviceId,
        businessId,
      },
      select: {
        id: true,
        vehicleId: true,
        status: true,
      },
    });

    if (!service) {
      return {
        success: false,
        message: "Shërbimi nuk u gjet në biznesin tuaj.",
      };
    }

    if (service.status === "CANCELLED") {
      return {
        success: false,
        message: "Një shërbim i anuluar nuk mund të përfundohet.",
      };
    }

    const normalizedItems = normalizeMaintenanceItems(items);
    const validationError = validateMaintenanceItems(normalizedItems);

    if (validationError) {
      return {
        success: false,
        message: validationError,
      };
    }

    await db.$transaction(async (tx) => {
      await tx.serviceRecord.update({
        where: {
          id: service.id,
        },
        data: {
          status: "COMPLETED",
        },
      });

      await tx.maintenanceItem.deleteMany({
        where: {
          serviceRecordId: service.id,
        },
      });

      if (normalizedItems.length > 0) {
        await tx.maintenanceItem.createMany({
          data: normalizedItems.map((item) => ({
            vehicleId: service.vehicleId,
            serviceRecordId: service.id,
            type: item.type,
            title: item.title,
            lastMileage: item.lastMileage,
            intervalKm: item.intervalKm,
            nextMileage: item.nextMileage,
            lastDate: item.lastDate,
            nextDate: item.nextDate,
            notes: item.notes,
            status: item.status,
          })),
        });
      }
    });

    revalidateServiceCompletion(service.id, service.vehicleId);

    return {
      success: true,
      message:
        normalizedItems.length > 0
          ? `Shërbimi u përfundua dhe u regjistruan ${normalizedItems.length} mirëmbajtje.`
          : "Shërbimi u përfundua pa regjistrime mirëmbajtjeje.",
    };
  } catch (error) {
    console.error("completeServiceWithMaintenance error:", error);

    return {
      success: false,
      message:
        error?.message || "Shërbimi nuk mund të përfundohej. Provo përsëri.",
    };
  }
}
