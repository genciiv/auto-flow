"use server";

import { revalidatePath } from "next/cache";

import {
  actionSuccess,
  errorFailure,
  validationFailure,
} from "@/lib/action-result";
import { requireCustomerActionContext } from "@/lib/customer-context";
import { validateFormData, validateObject } from "@/lib/validation";
import {
  addCustomerVehicleMileageSchema,
  createCustomerVehicleExpenseSchema,
  deleteCustomerVehicleExpenseSchema,
  parseCustomerHistoryDate,
} from "@/schemas/customer-vehicle-history-schema";
import {
  addCustomerVehicleMileage as addMileage,
  createCustomerVehicleExpense as createExpense,
  deleteCustomerVehicleExpense as deleteExpense,
} from "@/services/customer-vehicle-history-service";

function revalidateVehicleHistory(vehicleId) {
  revalidatePath(`/customer/vehicles/${vehicleId}`);
  revalidatePath("/customer/vehicles");
  revalidatePath("/customer/dashboard");
}

export async function addCustomerVehicleMileage(previousState, formData) {
  try {
    const { profileId } = await requireCustomerActionContext();
    const validation = validateFormData(
      addCustomerVehicleMileageSchema,
      formData,
    );

    if (!validation.success) {
      return validationFailure(validation.error, {
        message: "Kontrollo të dhënat e kilometrazhit.",
      });
    }

    const data = validation.data;

    await addMileage({
      profileId,
      vehicleId: data.vehicleId,
      mileage: data.mileage,
      recordedAt: parseCustomerHistoryDate(data.recordedAt),
      notes: data.notes,
    });

    revalidateVehicleHistory(data.vehicleId);

    return actionSuccess({
      message: "Kilometrazhi u regjistrua me sukses.",
    });
  } catch (error) {
    return errorFailure(error, {
      fallbackMessage: "Kilometrazhi nuk mund të regjistrohej.",
    });
  }
}

export async function createCustomerVehicleExpense(previousState, formData) {
  try {
    const { profileId } = await requireCustomerActionContext();
    const validation = validateFormData(
      createCustomerVehicleExpenseSchema,
      formData,
    );

    if (!validation.success) {
      return validationFailure(validation.error, {
        message: "Kontrollo të dhënat e shpenzimit.",
      });
    }

    const data = validation.data;

    await createExpense({
      profileId,
      vehicleId: data.vehicleId,
      type: data.type,
      amount: data.amount,
      occurredAt: parseCustomerHistoryDate(data.occurredAt),
      mileage: data.mileage,
      notes: data.notes,
    });

    revalidateVehicleHistory(data.vehicleId);

    return actionSuccess({
      message: "Shpenzimi u shtua në historikun e automjetit.",
    });
  } catch (error) {
    return errorFailure(error, {
      fallbackMessage: "Shpenzimi nuk mund të ruhej.",
    });
  }
}

export async function deleteCustomerVehicleExpense(vehicleId, expenseId) {
  try {
    const { profileId } = await requireCustomerActionContext();
    const validation = validateObject(deleteCustomerVehicleExpenseSchema, {
      vehicleId,
      expenseId,
    });

    if (!validation.success) {
      return validationFailure(validation.error);
    }

    await deleteExpense({
      profileId,
      vehicleId: validation.data.vehicleId,
      expenseId: validation.data.expenseId,
    });

    revalidateVehicleHistory(validation.data.vehicleId);

    return actionSuccess({
      message: "Shpenzimi u fshi me sukses.",
    });
  } catch (error) {
    return errorFailure(error, {
      fallbackMessage: "Shpenzimi nuk mund të fshihej.",
    });
  }
}
