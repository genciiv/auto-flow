import { db } from "@/lib/db";
import {
  createActionError,
  createNotFoundError,
  ERROR_CODES,
} from "@/lib/errors";
import { toMoney } from "@/lib/money";

const SERIALIZABLE_RETRY_CODES = new Set(["P2034", "P2028"]);

async function runSerializable(operation) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await db.$transaction(operation, {
        isolationLevel: "Serializable",
      });
    } catch (error) {
      if (
        attempt === maxAttempts ||
        !SERIALIZABLE_RETRY_CODES.has(error?.code)
      ) {
        throw error;
      }
    }
  }

  throw createActionError("Veprimi nuk mund të përfundohej. Provo përsëri.");
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

export async function addCustomerVehicleMileage({
  profileId,
  vehicleId,
  mileage,
  recordedAt,
  notes = null,
}) {
  return runSerializable(async (transaction) => {
    const vehicle = await getOwnedVehicle(transaction, profileId, vehicleId);

    const latestEntry = await transaction.customerVehicleMileage.findFirst({
      where: {
        customerVehicleId: vehicleId,
      },
      orderBy: [{ recordedAt: "desc" }, { createdAt: "desc" }],
      select: {
        mileage: true,
        recordedAt: true,
      },
    });

    if (vehicle.mileage !== null && mileage < vehicle.mileage) {
      throw createActionError(
        `Kilometrazhi nuk mund të jetë më i ulët se ${vehicle.mileage} km.`,
        {
          code: ERROR_CODES.CONFLICT,
          status: 409,
          fieldErrors: {
            mileage: `Vlera aktuale është ${vehicle.mileage} km.`,
          },
        },
      );
    }

    if (vehicle.mileage !== null && mileage === vehicle.mileage) {
      throw createActionError("Ky kilometrazh është regjistruar tashmë.", {
        code: ERROR_CODES.ALREADY_EXISTS,
        status: 409,
        fieldErrors: {
          mileage: "Vendos një vlerë më të lartë se kilometrazhi aktual.",
        },
      });
    }

    if (latestEntry && recordedAt < latestEntry.recordedAt) {
      throw createActionError(
        "Data duhet të jetë e njëjtë ose pas regjistrimit të fundit të kilometrave.",
        {
          code: ERROR_CODES.CONFLICT,
          status: 409,
          fieldErrors: {
            recordedAt: "Zgjidh një datë më të re.",
          },
        },
      );
    }

    const entry = await transaction.customerVehicleMileage.create({
      data: {
        customerVehicleId: vehicleId,
        mileage,
        recordedAt,
        source: "CUSTOMER",
        notes,
      },
    });

    await transaction.customerVehicle.update({
      where: {
        id: vehicleId,
      },
      data: {
        mileage,
      },
    });

    return entry;
  });
}

export async function createCustomerVehicleExpense({
  profileId,
  vehicleId,
  type,
  amount,
  occurredAt,
  mileage = null,
  notes = null,
}) {
  await getOwnedVehicle(db, profileId, vehicleId);

  return db.customerVehicleExpense.create({
    data: {
      customerVehicleId: vehicleId,
      type,
      amount: toMoney(amount),
      currency: "ALL",
      occurredAt,
      mileage,
      notes,
    },
  });
}

export async function deleteCustomerVehicleExpense({
  profileId,
  vehicleId,
  expenseId,
}) {
  const expense = await db.customerVehicleExpense.findFirst({
    where: {
      id: expenseId,
      customerVehicleId: vehicleId,
      customerVehicle: {
        profileId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!expense) {
    throw createNotFoundError(
      "Shpenzimi nuk u gjet ose nuk keni leje ta fshini.",
    );
  }

  await db.customerVehicleExpense.delete({
    where: {
      id: expense.id,
    },
  });

  return expense;
}
