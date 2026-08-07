import {
  CUSTOMER_VEHICLE_MAINTENANCE_LABELS,
  CUSTOMER_VEHICLE_REMINDER_LABELS,
} from "@/config/customer-vehicle-maintenance";
import { db } from "@/lib/db";
import {
  createActionError,
  createNotFoundError,
  ERROR_CODES,
} from "@/lib/errors";

function addMonthsClamped(date, months) {
  if (!date || !months) return null;

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetMonth = month + months;
  const firstDay = new Date(Date.UTC(year, targetMonth, 1, 12));
  const lastDay = new Date(
    Date.UTC(
      firstDay.getUTCFullYear(),
      firstDay.getUTCMonth() + 1,
      0,
      12,
    ),
  ).getUTCDate();

  return new Date(
    Date.UTC(
      firstDay.getUTCFullYear(),
      firstDay.getUTCMonth(),
      Math.min(day, lastDay),
      12,
    ),
  );
}

async function getOwnedVehicle(database, profileId, vehicleId) {
  const vehicle = await database.customerVehicle.findFirst({
    where: {
      id: vehicleId,
      profileId,
    },
    select: {
      id: true,
      mileage: true,
    },
  });

  if (!vehicle) {
    throw createNotFoundError(
      "Automjeti nuk u gjet ose nuk keni leje për këtë veprim.",
    );
  }

  return vehicle;
}

export async function createCustomerVehicleMaintenance({
  profileId,
  vehicleId,
  type,
  performedAt,
  mileage = null,
  intervalKm = null,
  intervalMonths = null,
  notes = null,
}) {
  const vehicle = await getOwnedVehicle(db, profileId, vehicleId);

  if (
    mileage !== null &&
    vehicle.mileage !== null &&
    mileage > vehicle.mileage
  ) {
    throw createActionError(
      "Kilometrat e mirëmbajtjes janë më të larta se kilometrazhi aktual i automjetit.",
      {
        code: ERROR_CODES.CONFLICT,
        status: 409,
        fieldErrors: {
          mileage:
            "Përditëso fillimisht kilometrat aktualë te historiku i automjetit.",
        },
      },
    );
  }

  const nextMileage =
    mileage !== null && intervalKm !== null ? mileage + intervalKm : null;
  const nextDate =
    intervalMonths !== null ? addMonthsClamped(performedAt, intervalMonths) : null;

  return db.customerVehicleMaintenance.create({
    data: {
      customerVehicleId: vehicleId,
      type,
      title: CUSTOMER_VEHICLE_MAINTENANCE_LABELS[type] || "Mirëmbajtje",
      performedAt,
      mileage,
      intervalKm,
      nextMileage,
      intervalMonths,
      nextDate,
      source: "CUSTOMER",
      notes,
    },
  });
}

export async function deleteCustomerVehicleMaintenance({
  profileId,
  vehicleId,
  maintenanceId,
}) {
  const item = await db.customerVehicleMaintenance.findFirst({
    where: {
      id: maintenanceId,
      customerVehicleId: vehicleId,
      customerVehicle: {
        profileId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!item) {
    throw createNotFoundError(
      "Mirëmbajtja nuk u gjet ose nuk keni leje ta fshini.",
    );
  }

  await db.customerVehicleMaintenance.delete({
    where: {
      id: item.id,
    },
  });

  return item;
}

export async function createCustomerVehicleReminder({
  profileId,
  vehicleId,
  type,
  title = null,
  dueDate = null,
  dueMileage = null,
  notes = null,
}) {
  const vehicle = await getOwnedVehicle(db, profileId, vehicleId);

  if (
    dueMileage !== null &&
    vehicle.mileage !== null &&
    dueMileage < vehicle.mileage
  ) {
    throw createActionError(
      "Kilometrazhi i kujtesës është më i ulët se kilometrazhi aktual.",
      {
        code: ERROR_CODES.CONFLICT,
        status: 409,
        fieldErrors: {
          dueMileage: `Automjeti është aktualisht në ${vehicle.mileage.toLocaleString("sq-AL")} km.`,
        },
      },
    );
  }

  const reminderTitle =
    type === "CUSTOM"
      ? title
      : CUSTOMER_VEHICLE_REMINDER_LABELS[type] || "Kujtesë";

  return db.$transaction(async (transaction) => {
    if (type !== "CUSTOM") {
      await transaction.customerVehicleReminder.updateMany({
        where: {
          customerVehicleId: vehicleId,
          type,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    return transaction.customerVehicleReminder.create({
      data: {
        customerVehicleId: vehicleId,
        type,
        title: reminderTitle,
        dueDate,
        dueMileage,
        notes,
      },
    });
  });
}

export async function deleteCustomerVehicleReminder({
  profileId,
  vehicleId,
  reminderId,
}) {
  const reminder = await db.customerVehicleReminder.findFirst({
    where: {
      id: reminderId,
      customerVehicleId: vehicleId,
      customerVehicle: {
        profileId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!reminder) {
    throw createNotFoundError(
      "Kujtesa nuk u gjet ose nuk keni leje ta fshini.",
    );
  }

  await db.customerVehicleReminder.delete({
    where: {
      id: reminder.id,
    },
  });

  return reminder;
}
