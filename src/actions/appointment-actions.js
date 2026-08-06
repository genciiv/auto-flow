"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { createAuditLog } from "@/services/audit-log-service";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import {
  changeAppointmentStatusSchema,
  createAppointmentSchema,
  deleteAppointmentSchema,
  startAppointmentServiceSchema,
  updateAppointmentSchema,
  rescheduleAppointmentSchema,
} from "@/schemas/appointment-schema";

import { createActionError } from "@/lib/errors";
import {
  assertAppointmentSlotAvailable,
  runSerializableAppointmentTransaction,
} from "@/lib/appointment-scheduling";
import { notifyUsersByRoles } from "@/services/operational-notification-service";
function revalidateAppointmentPages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/vehicles");
}

function getErrorMessage(error, fallbackMessage) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

async function validateAppointmentRelations({
  businessId,
  customerId,
  vehicleId,
  assignedUserId,
}) {
  let customer = null;
  let vehicle = null;
  let assignedUser = null;

  if (customerId) {
    customer = await db.customer.findFirst({
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
        success: false,
        message: "Klienti i zgjedhur nuk u gjet.",
      };
    }
  }

  if (vehicleId) {
    vehicle = await db.vehicle.findFirst({
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
        message: "Automjeti i zgjedhur nuk u gjet.",
      };
    }

    if (customerId && vehicle.customerId && vehicle.customerId !== customerId) {
      return {
        success: false,
        message: "Automjeti nuk i përket klientit të zgjedhur.",
      };
    }
  }


  if (assignedUserId) {
    const membership = await db.businessUser.findFirst({
      where: {
        businessId,
        userId: assignedUserId,
        isActive: true,
        role: { in: ["OWNER", "MANAGER", "MECHANIC", "RECEPTIONIST"] },
      },
      select: { user: { select: { id: true, name: true } } },
    });

    if (!membership) {
      return { success: false, message: "Punonjësi i zgjedhur nuk është aktiv në këtë biznes." };
    }

    assignedUser = membership.user;
  }

  return {
    success: true,
    customer,
    vehicle,
    assignedUser,
  };
}

export async function createAppointment(formData) {
  try {
    const { businessId, userId } = await requireBusinessActionPermission(
      PERMISSIONS.APPOINTMENTS_CREATE,
    );

    const validationResult = validateFormData(
      createAppointmentSchema,
      formData,
    );

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Termini nuk mund të krijohej.",
        ),
      };
    }

    const { title, description, customerId, vehicleId, assignedUserId, durationMinutes, date, status } =
      validationResult.data;

    const relationsResult = await validateAppointmentRelations({
      businessId,
      customerId,
      vehicleId,
      assignedUserId,
    });

    if (!relationsResult.success) {
      return relationsResult;
    }

    const appointment = await runSerializableAppointmentTransaction(
      db,
      async (transaction) => {
        await assertAppointmentSlotAvailable({
          database: transaction,
          businessId,
          assignedUserId,
          date,
          durationMinutes,
        });

        return transaction.appointment.create({
          data: {
            businessId,
            customerId,
            vehicleId,
            assignedUserId,
            durationMinutes,
            title,
            description,
            date,
            status,
            customerConfirmedAt: status === "CONFIRMED" ? new Date() : null,
          },
        });
      },
    );

    await notifyUsersByRoles({
      businessId,
      roles: ["OWNER", "MANAGER", "RECEPTIONIST"],
      title: "Termin i ri",
      message: `${title} u planifikua për ${new Intl.DateTimeFormat("sq-AL", { dateStyle: "short", timeStyle: "short" }).format(date)}.`,
      type: "INFO",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
    });

    await createAuditLog({
      businessId,
      userId,
      action: "CREATE",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      title: "U krijua termini",
      description: `${title} u planifikua.`,
      newValues: { title, date, status, customerId, vehicleId, assignedUserId, durationMinutes },
    });

    revalidateAppointmentPages();

    return {
      success: true,
      message: "Termini u krijua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë krijimit të terminit:", error);

    return {
      success: false,
      message: getErrorMessage(error, "Termini nuk mund të krijohej."),
    };
  }
}

export async function updateAppointment(formData) {
  try {
    const { businessId, userId } = await requireBusinessActionPermission(
      PERMISSIONS.APPOINTMENTS_UPDATE,
    );

    const validationResult = validateFormData(
      updateAppointmentSchema,
      formData,
    );

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Termini nuk mund të përditësohej.",
        ),
      };
    }

    const {
      appointmentId,
      title,
      description,
      customerId,
      vehicleId,
      assignedUserId,
      durationMinutes,
      date,
      status,
    } = validationResult.data;

    const appointment = await db.appointment.findFirst({
      where: {
        id: appointmentId,
        businessId,
      },

      select: {
        id: true,
        assignedUserId: true,
        date: true,
        durationMinutes: true,
        status: true,
        title: true,
        description: true,
        customerId: true,
        vehicleId: true,
      },
    });

    if (!appointment) {
      return {
        success: false,
        message: "Termini nuk u gjet.",
      };
    }

    const relationsResult = await validateAppointmentRelations({
      businessId,
      customerId,
      vehicleId,
      assignedUserId,
    });

    if (!relationsResult.success) {
      return relationsResult;
    }

    await runSerializableAppointmentTransaction(db, async (transaction) => {
      await assertAppointmentSlotAvailable({
        database: transaction,
        businessId,
        assignedUserId,
        date,
        durationMinutes,
        excludeAppointmentId: appointment.id,
      });

      await transaction.appointment.update({
        where: {
          id: appointment.id,
        },

        data: {
          customerId,
          vehicleId,
          assignedUserId,
          durationMinutes,
          title,
          description,
          date,
          status,
          customerConfirmedAt: status === "CONFIRMED" ? new Date() : null,
        },
      });
    });

    await createAuditLog({
      businessId,
      userId,
      action: "UPDATE",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      title: "U përditësua termini",
      oldValues: appointment,
      newValues: { title, description, customerId, vehicleId, assignedUserId, durationMinutes, date, status },
    });

    revalidateAppointmentPages();

    return {
      success: true,
      message: "Termini u përditësua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të terminit:", error);

    return {
      success: false,
      message: getErrorMessage(error, "Termini nuk mund të përditësohej."),
    };
  }
}

export async function deleteAppointment(appointmentId) {
  try {
    const { businessId, userId } = await requireBusinessActionPermission(
      PERMISSIONS.APPOINTMENTS_DELETE,
    );

    const validationResult = validateObject(deleteAppointmentSchema, {
      appointmentId,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Termini nuk u identifikua.",
        ),
      };
    }

    const validatedAppointmentId = validationResult.data.appointmentId;

    const appointment = await db.appointment.findFirst({
      where: {
        id: validatedAppointmentId,
        businessId,
      },

      select: {
        id: true,
      },
    });

    if (!appointment) {
      return {
        success: false,
        message: "Termini nuk u gjet.",
      };
    }

    await db.appointment.delete({
      where: {
        id: appointment.id,
      },
    });

    await createAuditLog({
      businessId,
      userId,
      action: "DELETE",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      title: "U fshi termini",
      oldValues: appointment,
    });

    revalidateAppointmentPages();

    return {
      success: true,
      message: "Termini u fshi me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë fshirjes së terminit:", error);

    return {
      success: false,
      message: getErrorMessage(error, "Termini nuk mund të fshihej."),
    };
  }
}

export async function updateAppointmentStatus(appointmentId, status) {
  try {
    const { businessId, userId } = await requireBusinessActionPermission(
      PERMISSIONS.APPOINTMENTS_UPDATE,
    );

    const validationResult = validateObject(changeAppointmentStatusSchema, {
      appointmentId,
      status,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Statusi nuk është i vlefshëm.",
        ),
      };
    }

    const { appointmentId: validatedAppointmentId, status: validatedStatus } =
      validationResult.data;

    const appointment = await db.appointment.findFirst({
      where: {
        id: validatedAppointmentId,
        businessId,
      },

      select: {
        id: true,
        status: true,
      },
    });

    if (!appointment) {
      return {
        success: false,
        message: "Termini nuk u gjet.",
      };
    }

    await db.appointment.update({
      where: {
        id: appointment.id,
      },

      data: {
        status: validatedStatus,
        customerConfirmedAt: validatedStatus === "CONFIRMED" ? new Date() : undefined,
      },
    });

    await createAuditLog({
      businessId,
      userId,
      action: "STATUS_CHANGE",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      title: "U ndryshua statusi i terminit",
      oldValues: { status: appointment.status },
      newValues: { status: validatedStatus },
    });

    revalidateAppointmentPages();

    return {
      success: true,
      message: "Statusi u ndryshua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë ndryshimit të statusit:", error);

    return {
      success: false,
      message: getErrorMessage(error, "Statusi nuk mund të ndryshohej."),
    };
  }
}

export async function startServiceFromAppointment(appointmentId) {
  try {
    const appointmentContext = await requireBusinessActionPermission(
      PERMISSIONS.APPOINTMENTS_UPDATE,
    );

    await requireBusinessActionPermission(PERMISSIONS.SERVICES_CREATE);

    const { businessId, userId } = appointmentContext;

    const validationResult = validateObject(startAppointmentServiceSchema, {
      appointmentId,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Termini nuk u identifikua.",
        ),
      };
    }

    const validatedAppointmentId = validationResult.data.appointmentId;

    const serviceResult = await runSerializableAppointmentTransaction(
      db,
      async (transaction) => {
      const appointment = await transaction.appointment.findFirst({
        where: {
          id: validatedAppointmentId,
          businessId,
        },

        select: {
          id: true,
          vehicleId: true,
          customerId: true,
          title: true,
          description: true,
          status: true,
          serviceId: true,
        },
      });

      if (!appointment) {
        throw createActionError("Termini nuk u gjet.");
      }

      if (appointment.serviceId) {
        const existingService = await transaction.serviceRecord.findFirst({
          where: {
            id: appointment.serviceId,
            businessId,
          },
        });

        if (existingService) {
          return { service: existingService, created: false };
        }
      }

      if (!appointment.vehicleId) {
        throw createActionError(
          "Termini duhet të ketë një automjet për të filluar servisin.",
        );
      }

      if (appointment.status === "COMPLETED") {
        throw createActionError("Ky termin është përfunduar.");
      }

      if (appointment.status === "CANCELLED") {
        throw createActionError("Një termin i anuluar nuk mund të fillojë servis.");
      }

      if (appointment.status === "IN_PROGRESS") {
        throw createActionError("Servisi për këtë termin është nisur tashmë.");
      }

      if (appointment.status === "NO_SHOW") {
        throw createActionError("Termini i shënuar si mosparaqitje nuk mund të nisë servis.");
      }

      const vehicle = await transaction.vehicle.findFirst({
        where: {
          id: appointment.vehicleId,
          businessId,
        },

        select: {
          id: true,
          customerId: true,
        },
      });

      if (!vehicle) {
        throw createActionError("Automjeti i terminit nuk u gjet.");
      }

      if (appointment.customerId) {
        const customer = await transaction.customer.findFirst({
          where: {
            id: appointment.customerId,
            businessId,
          },

          select: {
            id: true,
          },
        });

        if (!customer) {
          throw createActionError("Klienti i terminit nuk u gjet.");
        }

        if (
          vehicle.customerId &&
          vehicle.customerId !== appointment.customerId
        ) {
          throw createActionError("Automjeti nuk i përket klientit të terminit.");
        }
      }

      const updatedAppointment = await transaction.appointment.updateMany({
        where: {
          id: appointment.id,
          businessId,
          status: { in: ["PENDING", "CONFIRMED"] },
        },

        data: {
          status: "IN_PROGRESS",
        },
      });

      if (updatedAppointment.count !== 1) {
        throw createActionError(
          "Termini është ndryshuar ose servisi është nisur më parë.",
        );
      }

      const createdService = await transaction.serviceRecord.create({
        data: {
          businessId,
          vehicleId: appointment.vehicleId,
          customerId: appointment.customerId || vehicle.customerId || null,
          title: appointment.title,
          description: appointment.description,
          status: "IN_PROGRESS",
          total: 0,
        },
      });

      await transaction.appointment.update({
        where: { id: appointment.id },
        data: { serviceId: createdService.id },
      });

      return { service: createdService, created: true };
      },
    );

    if (serviceResult.created) {
      await createAuditLog({
        businessId,
        userId,
        action: "CREATE",
        entityType: "SERVICE_FROM_APPOINTMENT",
        entityId: serviceResult.service.id,
        title: "U nis servisi nga termini",
        metadata: { appointmentId },
        newValues: {
          serviceId: serviceResult.service.id,
          status: "IN_PROGRESS",
        },
      });
    }

    revalidateAppointmentPages();

    return {
      success: true,
      message: serviceResult.created
        ? "Servisi u krijua dhe u nis me sukses."
        : "Servisi për këtë termin është nisur tashmë.",
      serviceId: serviceResult.service.id,
    };
  } catch (error) {
    console.error("Gabim gjatë nisjes së servisit:", error);

    return {
      success: false,
      message: getErrorMessage(error, "Servisi nuk mund të fillohej."),
    };
  }
}

export async function rescheduleAppointment(formData) {
  try {
    const { businessId, userId } = await requireBusinessActionPermission(PERMISSIONS.APPOINTMENTS_UPDATE);
    const validationResult = validateFormData(rescheduleAppointmentSchema, formData);
    if (!validationResult.success) {
      return { success: false, message: getFirstValidationMessage(validationResult.error, "Termini nuk mund të riplanifikohej.") };
    }
    const { appointmentId, date } = validationResult.data;
    const appointment = await db.appointment.findFirst({
      where: { id: appointmentId, businessId },
      select: {
        id: true,
        status: true,
        assignedUserId: true,
        durationMinutes: true,
        date: true,
      },
    });
    if (!appointment) return { success: false, message: "Termini nuk u gjet." };
    if (["COMPLETED", "CANCELLED", "NO_SHOW"].includes(appointment.status)) return { success: false, message: "Ky termin nuk mund të riplanifikohet." };

    await runSerializableAppointmentTransaction(db, async (transaction) => {
      await assertAppointmentSlotAvailable({
        database: transaction,
        businessId,
        assignedUserId: appointment.assignedUserId,
        date,
        durationMinutes: appointment.durationMinutes,
        excludeAppointmentId: appointment.id,
      });

      await transaction.appointment.update({
        where: { id: appointment.id },
        data: { date, reminderSentAt: null },
      });
    });
    await createAuditLog({
      businessId,
      userId,
      action: "UPDATE",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      title: "U riplanifikua termini",
      oldValues: { status: appointment.status },
      newValues: { date },
    });
    revalidateAppointmentPages();
    return { success: true, message: "Termini u riplanifikua me sukses." };
  } catch (error) {
    console.error("Gabim gjatë riplanifikimit të terminit:", error);
    return { success: false, message: getErrorMessage(error, "Termini nuk mund të riplanifikohej.") };
  }
}
