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
  createCustomerVehicleMaintenanceSchema,
  createCustomerVehicleReminderSchema,
  deleteCustomerVehicleMaintenanceSchema,
  deleteCustomerVehicleReminderSchema,
  parseCustomerVehicleMaintenanceDate,
} from "@/schemas/customer-vehicle-maintenance-schema";
import {
  createCustomerVehicleMaintenance as createMaintenance,
  createCustomerVehicleReminder as createReminder,
  deleteCustomerVehicleMaintenance as deleteMaintenance,
  deleteCustomerVehicleReminder as deleteReminder,
} from "@/services/customer-vehicle-maintenance-service";

function revalidateCustomerMaintenance(vehicleId) {
  revalidatePath(`/customer/vehicles/${vehicleId}`);
  revalidatePath("/customer/vehicles");
  revalidatePath("/customer/dashboard");
}

export async function createCustomerVehicleMaintenance(previousState, formData) {
  try {
    const { profileId } = await requireCustomerActionContext();
    const validation = validateFormData(
      createCustomerVehicleMaintenanceSchema,
      formData,
    );

    if (!validation.success) {
      return validationFailure(validation.error, {
        message: "Kontrollo të dhënat e mirëmbajtjes.",
      });
    }

    const data = validation.data;

    await createMaintenance({
      profileId,
      vehicleId: data.vehicleId,
      type: data.type,
      performedAt: parseCustomerVehicleMaintenanceDate(data.performedAt),
      mileage: data.mileage,
      intervalKm: data.intervalKm,
      intervalMonths: data.intervalMonths,
      notes: data.notes,
    });

    revalidateCustomerMaintenance(data.vehicleId);

    return actionSuccess({
      message: "Mirëmbajtja u shtua në dosjen e automjetit.",
    });
  } catch (error) {
    return errorFailure(error, {
      fallbackMessage: "Mirëmbajtja nuk mund të ruhej.",
    });
  }
}

export async function createCustomerVehicleReminder(previousState, formData) {
  try {
    const { profileId } = await requireCustomerActionContext();
    const validation = validateFormData(
      createCustomerVehicleReminderSchema,
      formData,
    );

    if (!validation.success) {
      return validationFailure(validation.error, {
        message: "Kontrollo të dhënat e kujtesës.",
      });
    }

    const data = validation.data;

    await createReminder({
      profileId,
      vehicleId: data.vehicleId,
      type: data.type,
      title: data.title,
      dueDate: data.dueDate
        ? parseCustomerVehicleMaintenanceDate(data.dueDate)
        : null,
      dueMileage: data.dueMileage,
      notes: data.notes,
    });

    revalidateCustomerMaintenance(data.vehicleId);

    return actionSuccess({
      message: "Kujtesa u ruajt me sukses.",
    });
  } catch (error) {
    return errorFailure(error, {
      fallbackMessage: "Kujtesa nuk mund të ruhej.",
    });
  }
}

export async function deleteCustomerVehicleMaintenance(vehicleId, maintenanceId) {
  try {
    const { profileId } = await requireCustomerActionContext();
    const validation = validateObject(deleteCustomerVehicleMaintenanceSchema, {
      vehicleId,
      maintenanceId,
    });

    if (!validation.success) {
      return validationFailure(validation.error);
    }

    await deleteMaintenance({
      profileId,
      vehicleId: validation.data.vehicleId,
      maintenanceId: validation.data.maintenanceId,
    });

    revalidateCustomerMaintenance(validation.data.vehicleId);

    return actionSuccess({
      message: "Regjistrimi i mirëmbajtjes u fshi.",
    });
  } catch (error) {
    return errorFailure(error, {
      fallbackMessage: "Mirëmbajtja nuk mund të fshihej.",
    });
  }
}

export async function deleteCustomerVehicleReminder(vehicleId, reminderId) {
  try {
    const { profileId } = await requireCustomerActionContext();
    const validation = validateObject(deleteCustomerVehicleReminderSchema, {
      vehicleId,
      reminderId,
    });

    if (!validation.success) {
      return validationFailure(validation.error);
    }

    await deleteReminder({
      profileId,
      vehicleId: validation.data.vehicleId,
      reminderId: validation.data.reminderId,
    });

    revalidateCustomerMaintenance(validation.data.vehicleId);

    return actionSuccess({
      message: "Kujtesa u fshi.",
    });
  } catch (error) {
    return errorFailure(error, {
      fallbackMessage: "Kujtesa nuk mund të fshihej.",
    });
  }
}
