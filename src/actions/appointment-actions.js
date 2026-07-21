"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function revalidateAppointmentPages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/vehicles");
}

function getOptionalString(formData, key) {
  const value = formData.get(key);

  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue || null;
}

function normalizeStatus(value, fallback = "PENDING") {
  return String(value || fallback)
    .trim()
    .toUpperCase();
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
}) {
  let customer = null;
  let vehicle = null;

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

  return {
    success: true,
    customer,
    vehicle,
  };
}

export async function createAppointment(formData) {
  try {
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.APPOINTMENTS_CREATE,
    );

    const title = getOptionalString(formData, "title");
    const description = getOptionalString(formData, "description");
    const customerId = getOptionalString(formData, "customerId");
    const vehicleId = getOptionalString(formData, "vehicleId");
    const dateValue = getOptionalString(formData, "date");

    const status = normalizeStatus(getOptionalString(formData, "status"));

    if (!title) {
      return {
        success: false,
        message: "Titulli i terminit është i detyrueshëm.",
      };
    }

    if (!dateValue) {
      return {
        success: false,
        message: "Data dhe ora janë të detyrueshme.",
      };
    }

    if (!VALID_STATUSES.includes(status)) {
      return {
        success: false,
        message: "Statusi nuk është i vlefshëm.",
      };
    }

    const appointmentDate = new Date(dateValue);

    if (Number.isNaN(appointmentDate.getTime())) {
      return {
        success: false,
        message: "Data e terminit nuk është e vlefshme.",
      };
    }

    const relationsResult = await validateAppointmentRelations({
      businessId,
      customerId,
      vehicleId,
    });

    if (!relationsResult.success) {
      return relationsResult;
    }

    await db.appointment.create({
      data: {
        businessId,
        customerId,
        vehicleId,
        title,
        description,
        date: appointmentDate,
        status,
      },
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
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.APPOINTMENTS_UPDATE,
    );

    const appointmentId = getOptionalString(formData, "appointmentId");

    const title = getOptionalString(formData, "title");
    const description = getOptionalString(formData, "description");
    const customerId = getOptionalString(formData, "customerId");
    const vehicleId = getOptionalString(formData, "vehicleId");
    const dateValue = getOptionalString(formData, "date");

    const status = normalizeStatus(getOptionalString(formData, "status"));

    if (!appointmentId) {
      return {
        success: false,
        message: "Termini nuk u identifikua.",
      };
    }

    if (!title) {
      return {
        success: false,
        message: "Titulli është i detyrueshëm.",
      };
    }

    if (!dateValue) {
      return {
        success: false,
        message: "Data dhe ora janë të detyrueshme.",
      };
    }

    if (!VALID_STATUSES.includes(status)) {
      return {
        success: false,
        message: "Statusi nuk është i vlefshëm.",
      };
    }

    const appointmentDate = new Date(dateValue);

    if (Number.isNaN(appointmentDate.getTime())) {
      return {
        success: false,
        message: "Data e terminit nuk është e vlefshme.",
      };
    }

    const appointment = await db.appointment.findFirst({
      where: {
        id: appointmentId,
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

    const relationsResult = await validateAppointmentRelations({
      businessId,
      customerId,
      vehicleId,
    });

    if (!relationsResult.success) {
      return relationsResult;
    }

    await db.appointment.update({
      where: {
        id: appointment.id,
      },
      data: {
        customerId,
        vehicleId,
        title,
        description,
        date: appointmentDate,
        status,
      },
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
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.APPOINTMENTS_DELETE,
    );

    if (!appointmentId || typeof appointmentId !== "string") {
      return {
        success: false,
        message: "Termini nuk u identifikua.",
      };
    }

    const appointment = await db.appointment.findFirst({
      where: {
        id: appointmentId,
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
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.APPOINTMENTS_UPDATE,
    );

    if (!appointmentId || typeof appointmentId !== "string") {
      return {
        success: false,
        message: "Termini nuk u identifikua.",
      };
    }

    const normalizedStatus = normalizeStatus(status, "");

    if (!VALID_STATUSES.includes(normalizedStatus)) {
      return {
        success: false,
        message: "Statusi nuk është i vlefshëm.",
      };
    }

    const appointment = await db.appointment.findFirst({
      where: {
        id: appointmentId,
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

    await db.appointment.update({
      where: {
        id: appointment.id,
      },
      data: {
        status: normalizedStatus,
      },
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

    const { businessId } = appointmentContext;

    if (!appointmentId || typeof appointmentId !== "string") {
      return {
        success: false,
        message: "Termini nuk u identifikua.",
      };
    }

    const service = await db.$transaction(async (transaction) => {
      const appointment = await transaction.appointment.findFirst({
        where: {
          id: appointmentId,
          businessId,
        },
        select: {
          id: true,
          vehicleId: true,
          customerId: true,
          title: true,
          description: true,
          status: true,
        },
      });

      if (!appointment) {
        throw new Error("Termini nuk u gjet.");
      }

      if (!appointment.vehicleId) {
        throw new Error(
          "Termini duhet të ketë një automjet për të filluar servisin.",
        );
      }

      if (appointment.status === "COMPLETED") {
        throw new Error("Ky termin është përfunduar.");
      }

      if (appointment.status === "CANCELLED") {
        throw new Error("Një termin i anuluar nuk mund të fillojë servis.");
      }

      if (appointment.status === "IN_PROGRESS") {
        throw new Error("Servisi për këtë termin është nisur tashmë.");
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
        throw new Error("Automjeti i terminit nuk u gjet.");
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
          throw new Error("Klienti i terminit nuk u gjet.");
        }

        if (
          vehicle.customerId &&
          vehicle.customerId !== appointment.customerId
        ) {
          throw new Error("Automjeti nuk i përket klientit të terminit.");
        }
      }

      const updatedAppointment = await transaction.appointment.updateMany({
        where: {
          id: appointment.id,
          businessId,
          status: "PENDING",
        },
        data: {
          status: "IN_PROGRESS",
        },
      });

      if (updatedAppointment.count !== 1) {
        throw new Error(
          "Termini është ndryshuar ose servisi është nisur më parë.",
        );
      }

      return transaction.serviceRecord.create({
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
    });

    revalidateAppointmentPages();

    return {
      success: true,
      message: "Servisi u krijua dhe u nis me sukses.",
      serviceId: service.id,
    };
  } catch (error) {
    console.error("Gabim gjatë nisjes së servisit:", error);

    return {
      success: false,
      message: getErrorMessage(error, "Servisi nuk mund të fillohej."),
    };
  }
}
