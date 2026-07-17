"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createVehicle(formData) {
  try {
    const customerId = formData.get("customerId");
    const plate = formData.get("plate")?.trim().toUpperCase();
    const brand = formData.get("brand")?.trim();
    const model = formData.get("model")?.trim();
    const yearValue = formData.get("year");
    const vin = formData.get("vin")?.trim().toUpperCase();

    if (!plate || !brand) {
      return {
        success: false,
        message: "Targa dhe marka janë të detyrueshme.",
      };
    }

    const year = yearValue ? Number(yearValue) : null;

    if (
      year !== null &&
      (!Number.isInteger(year) || year < 1900 || year > 2100)
    ) {
      return {
        success: false,
        message: "Viti i automjetit nuk është i vlefshëm.",
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

    const existingPlate = await db.vehicle.findFirst({
      where: {
        plate,
      },
      select: {
        id: true,
      },
    });

    if (existingPlate) {
      return {
        success: false,
        message: "Ekziston një automjet me këtë targë.",
      };
    }

    if (vin) {
      const existingVin = await db.vehicle.findFirst({
        where: {
          vin,
        },
        select: {
          id: true,
        },
      });

      if (existingVin) {
        return {
          success: false,
          message: "Ekziston një automjet me këtë VIN.",
        };
      }
    }

    await db.vehicle.create({
      data: {
        businessId: business.id,
        customerId: customerId || null,
        plate,
        brand,
        model: model || null,
        year,
        vin: vin || null,
      },
    });

    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Automjeti u krijua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë krijimit të automjetit:", error);

    return {
      success: false,
      message: "Ndodhi një gabim gjatë krijimit të automjetit.",
    };
  }
}

export async function updateVehicle(formData) {
  try {
    const id = formData.get("id");
    const customerId = formData.get("customerId");
    const plate = formData.get("plate")?.trim().toUpperCase();
    const brand = formData.get("brand")?.trim();
    const model = formData.get("model")?.trim();
    const yearValue = formData.get("year");
    const vin = formData.get("vin")?.trim().toUpperCase();

    if (!id) {
      return {
        success: false,
        message: "ID e automjetit mungon.",
      };
    }

    if (!plate || !brand) {
      return {
        success: false,
        message: "Targa dhe marka janë të detyrueshme.",
      };
    }

    const year = yearValue ? Number(yearValue) : null;

    if (
      year !== null &&
      (!Number.isInteger(year) || year < 1900 || year > 2100)
    ) {
      return {
        success: false,
        message: "Viti i automjetit nuk është i vlefshëm.",
      };
    }

    const vehicle = await db.vehicle.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!vehicle) {
      return {
        success: false,
        message: "Automjeti nuk u gjet.",
      };
    }

    const existingPlate = await db.vehicle.findFirst({
      where: {
        plate,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingPlate) {
      return {
        success: false,
        message: "Ekziston një automjet tjetër me këtë targë.",
      };
    }

    if (vin) {
      const existingVin = await db.vehicle.findFirst({
        where: {
          vin,
          NOT: {
            id,
          },
        },
        select: {
          id: true,
        },
      });

      if (existingVin) {
        return {
          success: false,
          message: "Ekziston një automjet tjetër me këtë VIN.",
        };
      }
    }

    await db.vehicle.update({
      where: {
        id,
      },
      data: {
        customerId: customerId || null,
        plate,
        brand,
        model: model || null,
        year,
        vin: vin || null,
      },
    });

    revalidatePath("/dashboard/vehicles");
    revalidatePath(`/dashboard/vehicles/${id}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Automjeti u përditësua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të automjetit:", error);

    return {
      success: false,
      message: "Ndodhi një gabim gjatë përditësimit të automjetit.",
    };
  }
}

export async function deleteVehicle(vehicleId) {
  try {
    if (!vehicleId) {
      return {
        success: false,
        message: "ID e automjetit mungon.",
      };
    }

    const vehicle = await db.vehicle.findUnique({
      where: {
        id: vehicleId,
      },
      select: {
        id: true,
        plate: true,
      },
    });

    if (!vehicle) {
      return {
        success: false,
        message: "Automjeti nuk u gjet.",
      };
    }

    const serviceCount = await db.serviceRecord.count({
      where: {
        vehicleId,
      },
    });

    if (serviceCount > 0) {
      return {
        success: false,
        message:
          "Automjeti nuk mund të fshihet sepse ka shërbime të regjistruara.",
      };
    }

    await db.vehicle.delete({
      where: {
        id: vehicleId,
      },
    });

    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Automjeti u fshi me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë fshirjes së automjetit:", error);

    return {
      success: false,
      message:
        "Automjeti nuk mund të fshihet sepse është i lidhur me të dhëna të tjera.",
    };
  }
}
