import { db } from "@/lib/db";

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function getStartOfDay(date) {
  const value = new Date(date);

  value.setHours(0, 0, 0, 0);

  return value;
}

function getEndOfDay(date) {
  const value = new Date(date);

  value.setHours(23, 59, 59, 999);

  return value;
}

function normalizeDate(value) {
  if (!value) {
    return new Date();
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date();
  }

  return parsedDate;
}

function normalizeStatus(status) {
  if (!status || status === "all") {
    return "all";
  }

  return VALID_STATUSES.includes(status) ? status : "all";
}

export async function getCalendarData({
  businessId,
  selectedDate,
  status = "all",
  search = "",
}) {
  const currentDate = normalizeDate(selectedDate);
  const normalizedStatus = normalizeStatus(status);
  const normalizedSearch = search.trim();

  const startOfDay = getStartOfDay(currentDate);
  const endOfDay = getEndOfDay(currentDate);

  const where = {
    businessId,

    date: {
      gte: startOfDay,
      lte: endOfDay,
    },

    ...(normalizedStatus !== "all"
      ? {
          status: normalizedStatus,
        }
      : {}),

    ...(normalizedSearch
      ? {
          OR: [
            {
              title: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              customer: {
                name: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
            {
              vehicle: {
                plate: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
            {
              vehicle: {
                brand: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  const [
    appointments,
    customers,
    vehicles,
    pendingCount,
    inProgressCount,
    completedCount,
    cancelledCount,
  ] = await Promise.all([
    db.appointment.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },

        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            customerId: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    }),

    db.customer.findMany({
      where: {
        businessId,
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    db.vehicle.findMany({
      where: {
        businessId,
      },
      select: {
        id: true,
        plate: true,
        brand: true,
        model: true,
        customerId: true,
      },
      orderBy: {
        plate: "asc",
      },
    }),

    db.appointment.count({
      where: {
        businessId,
        status: "PENDING",
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    }),

    db.appointment.count({
      where: {
        businessId,
        status: "IN_PROGRESS",
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    }),

    db.appointment.count({
      where: {
        businessId,
        status: "COMPLETED",
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    }),

    db.appointment.count({
      where: {
        businessId,
        status: "CANCELLED",
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    }),
  ]);

  return {
    appointments,
    customers,
    vehicles,

    selectedDate: currentDate,

    filters: {
      status: normalizedStatus,
      search: normalizedSearch,
    },

    counts: {
      total: pendingCount + inProgressCount + completedCount + cancelledCount,
      pending: pendingCount,
      inProgress: inProgressCount,
      completed: completedCount,
      cancelled: cancelledCount,
    },
  };
}

export async function getAppointmentById({ businessId, appointmentId }) {
  if (!appointmentId) {
    return null;
  }

  return db.appointment.findFirst({
    where: {
      id: appointmentId,
      businessId,
    },
    include: {
      customer: true,
      vehicle: true,
    },
  });
}

export async function createAppointment({
  businessId,
  title,
  description,
  date,
  customerId,
  vehicleId,
}) {
  const appointmentDate = new Date(date);

  if (Number.isNaN(appointmentDate.getTime())) {
    throw new Error("Data ose ora e terminit nuk është e vlefshme.");
  }

  let selectedCustomerId = customerId || null;
  let selectedVehicleId = vehicleId || null;

  if (selectedCustomerId) {
    const customer = await db.customer.findFirst({
      where: {
        id: selectedCustomerId,
        businessId,
      },
      select: {
        id: true,
      },
    });

    if (!customer) {
      throw new Error("Klienti i zgjedhur nuk u gjet.");
    }
  }

  if (selectedVehicleId) {
    const vehicle = await db.vehicle.findFirst({
      where: {
        id: selectedVehicleId,
        businessId,
      },
      select: {
        id: true,
        customerId: true,
      },
    });

    if (!vehicle) {
      throw new Error("Automjeti i zgjedhur nuk u gjet.");
    }

    if (!selectedCustomerId && vehicle.customerId) {
      selectedCustomerId = vehicle.customerId;
    }
  }

  return db.appointment.create({
    data: {
      businessId,
      title: title.trim(),
      description: description?.trim() || null,
      date: appointmentDate,
      status: "PENDING",
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
    },
  });
}

export async function updateAppointmentStatus({
  businessId,
  appointmentId,
  status,
}) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Statusi i terminit nuk është i vlefshëm.");
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
    throw new Error("Termini nuk u gjet.");
  }

  return db.appointment.update({
    where: {
      id: appointment.id,
    },
    data: {
      status,
    },
  });
}

export async function deleteAppointment({ businessId, appointmentId }) {
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
    throw new Error("Termini nuk u gjet.");
  }

  return db.appointment.delete({
    where: {
      id: appointment.id,
    },
  });
}
