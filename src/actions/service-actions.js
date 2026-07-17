"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

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
    const vehicleId = formData.get("vehicleId");
    const title = formData.get("title")?.trim();
    const description = formData.get("description")?.trim();
    const status = formData.get("status") || "PENDING";
    const totalValue = formData.get("total");

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

    const business = await db.business.findFirst({
      select: {
        id: true,
      },
    });

    if (!business) {
      return {
        success: false,
        message: "Nuk u gjet biznes aktiv.",
      };
    }

    const vehicle = await db.vehicle.findUnique({
      where: {
        id: vehicleId,
      },
      include: {
        customer: true,
      },
    });

    if (!vehicle) {
      return {
        success: false,
        message: "Automjeti nuk u gjet.",
      };
    }

    const service = await db.serviceRecord.create({
      data: {
        businessId: business.id,
        vehicleId: vehicle.id,
        customerId: vehicle.customer?.id || null,
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

    return {
      success: false,
      message: "Ndodhi një gabim gjatë krijimit të shërbimit.",
    };
  }
}

export async function updateService(formData) {
  try {
    const id = formData.get("id");
    const vehicleId = formData.get("vehicleId");
    const title = formData.get("title")?.trim();
    const description = formData.get("description")?.trim();
    const status = formData.get("status");
    const totalValue = formData.get("total");

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
      db.serviceRecord.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      }),

      db.vehicle.findUnique({
        where: {
          id: vehicleId,
        },
        include: {
          customer: true,
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
        message: "Automjeti nuk u gjet.",
      };
    }

    await db.serviceRecord.update({
      where: {
        id,
      },
      data: {
        vehicleId: vehicle.id,
        customerId: vehicle.customer?.id || null,
        title,
        description: description || null,
        status,
        total,
      },
    });

    refreshServicePages(id);

    return {
      success: true,
      message: "Shërbimi u përditësua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të shërbimit:", error);

    return {
      success: false,
      message: "Ndodhi një gabim gjatë përditësimit të shërbimit.",
    };
  }
}

export async function updateServiceStatus(serviceId, status) {
  try {
    if (!serviceId) {
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

    const service = await db.serviceRecord.findUnique({
      where: {
        id: serviceId,
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
        id: serviceId,
      },
      data: {
        status,
      },
    });

    refreshServicePages(serviceId);

    return {
      success: true,
      message: "Statusi u përditësua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë ndryshimit të statusit:", error);

    return {
      success: false,
      message: "Ndodhi një gabim gjatë ndryshimit të statusit.",
    };
  }
}

export async function deleteService(serviceId) {
  try {
    if (!serviceId) {
      return {
        success: false,
        message: "ID e shërbimit mungon.",
      };
    }

    const service = await db.serviceRecord.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        partsUsed: true,
        invoice: true,
      },
    });

    if (!service) {
      return {
        success: false,
        message: "Shërbimi nuk u gjet.",
      };
    }

    if (service.partsUsed.length > 0) {
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
        id: serviceId,
      },
    });

    refreshServicePages();

    return {
      success: true,
      message: "Shërbimi u fshi me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë fshirjes së shërbimit:", error);

    return {
      success: false,
      message:
        "Shërbimi nuk mund të fshihet sepse është i lidhur me të dhëna të tjera.",
    };
  }
}
