"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function revalidateAppointmentPages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/services");
}

function getOptionalString(formData, key) {
  const value = formData.get(key);

  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue || null;
}

async function getBusiness() {
  return db.business.findFirst({
    select: {
      id: true,
    },
  });
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
    const title = getOptionalString(formData, "title");
    const description = getOptionalString(formData, "description");
    const customerId = getOptionalString(formData, "customerId");
    const vehicleId = getOptionalString(formData, "vehicleId");
    const dateValue = getOptionalString(formData, "date");
    const status = getOptionalString(formData, "status") || "PENDING";

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

    const business = await getBusiness();

    if (!business) {
      return {
        success: false,
        message: "Nuk u gjet biznes aktiv.",
      };
    }

    const relationsResult = await validateAppointmentRelations({
      businessId: business.id,
      customerId,
      vehicleId,
    });

    if (!relationsResult.success) {
      return relationsResult;
    }

    await db.appointment.create({
      data: {
        businessId: business.id,
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
      message: "Termini nuk mund të krijohej.",
    };
  }
}

export async function updateAppointment(formData) {
  try {
    const appointmentId = getOptionalString(formData, "appointmentId");
    const title = getOptionalString(formData, "title");
    const description = getOptionalString(formData, "description");
    const customerId = getOptionalString(formData, "customerId");
    const vehicleId = getOptionalString(formData, "vehicleId");
    const dateValue = getOptionalString(formData, "date");
    const status = getOptionalString(formData, "status") || "PENDING";

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

    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      select: {
        id: true,
        businessId: true,
      },
    });

    if (!appointment) {
      return {
        success: false,
        message: "Termini nuk u gjet.",
      };
    }

    const relationsResult = await validateAppointmentRelations({
      businessId: appointment.businessId,
      customerId,
      vehicleId,
    });

    if (!relationsResult.success) {
      return relationsResult;
    }

    await db.appointment.update({
      where: {
        id: appointmentId,
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
      message: "Termini nuk mund të përditësohej.",
    };
  }
}

export async function deleteAppointment(appointmentId) {
  try {
    if (!appointmentId) {
      return {
        success: false,
        message: "Termini nuk u identifikua.",
      };
    }

    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
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
        id: appointmentId,
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
      message: "Termini nuk mund të fshihej.",
    };
  }
}

export async function updateAppointmentStatus(appointmentId, status) {
  try {
    if (!appointmentId) {
      return {
        success: false,
        message: "Termini nuk u identifikua.",
      };
    }

    if (!VALID_STATUSES.includes(status)) {
      return {
        success: false,
        message: "Statusi nuk është i vlefshëm.",
      };
    }

    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
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
        id: appointmentId,
      },
      data: {
        status,
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
      message: "Statusi nuk mund të ndryshohej.",
    };
  }
}

export async function startServiceFromAppointment(appointmentId) {
  try {
    if (!appointmentId) {
      return {
        success: false,
        message: "Termini nuk u identifikua.",
      };
    }

    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      select: {
        id: true,
        businessId: true,
        vehicleId: true,
        customerId: true,
        title: true,
        description: true,
        status: true,
      },
    });

    if (!appointment) {
      return {
        success: false,
        message: "Termini nuk u gjet.",
      };
    }

    if (!appointment.vehicleId) {
      return {
        success: false,
        message: "Termini duhet të ketë një automjet për të filluar servisin.",
      };
    }

    if (appointment.status === "COMPLETED") {
      return {
        success: false,
        message: "Ky termin është përfunduar.",
      };
    }

    if (appointment.status === "CANCELLED") {
      return {
        success: false,
        message: "Një termin i anuluar nuk mund të fillojë servis.",
      };
    }

    if (appointment.status === "IN_PROGRESS") {
      return {
        success: false,
        message: "Servisi për këtë termin është nisur tashmë.",
      };
    }

    const service = await db.$transaction(async (transaction) => {
      const createdService = await transaction.serviceRecord.create({
        data: {
          businessId: appointment.businessId,
          vehicleId: appointment.vehicleId,
          customerId: appointment.customerId,
          title: appointment.title,
          description: appointment.description,
          status: "IN_PROGRESS",
          total: 0,
        },
      });

      await transaction.appointment.update({
        where: {
          id: appointment.id,
        },
        data: {
          status: "IN_PROGRESS",
        },
      });

      return createdService;
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
      message: "Servisi nuk mund të fillohej.",
    };
  }
}
