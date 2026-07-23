"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireCustomerActionContext } from "@/lib/customer-context";

function normalizePlate(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function normalizeVin(value) {
  const vin = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  return vin || null;
}

export async function searchWorkshopVehicles(
  customerVehicleId,
  previousState,
  formData,
) {
  try {
    const { profileId } = await requireCustomerActionContext();

    const customerVehicle = await db.customerVehicle.findFirst({
      where: {
        id: customerVehicleId,
        profileId,
      },
      select: {
        id: true,
        plate: true,
        vin: true,
      },
    });

    if (!customerVehicle) {
      return {
        success: false,
        message: "Automjeti nuk u gjet.",
        vehicles: [],
      };
    }

    const plate =
      normalizePlate(formData.get("plate")) ||
      normalizePlate(customerVehicle.plate);

    const vin =
      normalizeVin(formData.get("vin")) || normalizeVin(customerVehicle.vin);

    if (!plate && !vin) {
      return {
        success: false,
        message: "Vendos targën ose numrin VIN.",
        vehicles: [],
      };
    }

    const vehicles = await db.vehicle.findMany({
      where: {
        OR: [
          ...(plate
            ? [
                {
                  plate: {
                    equals: plate,
                    mode: "insensitive",
                  },
                },
              ]
            : []),

          ...(vin
            ? [
                {
                  vin: {
                    equals: vin,
                    mode: "insensitive",
                  },
                },
              ]
            : []),
        ],

        business: {
          isActive: true,
        },
      },

      select: {
        id: true,
        plate: true,
        brand: true,
        model: true,
        year: true,
        vin: true,

        business: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
          },
        },

        portalClaims: {
          where: {
            customerVehicleId,
          },

          select: {
            id: true,
            status: true,
          },
        },
      },

      orderBy: [
        {
          business: {
            name: "asc",
          },
        },
        {
          createdAt: "desc",
        },
      ],

      take: 20,
    });

    return {
      success: true,
      message:
        vehicles.length > 0
          ? `U gjetën ${vehicles.length} regjistrime të mundshme.`
          : "Nuk u gjet asnjë automjet te serviset e regjistruara.",
      vehicles: vehicles.map((vehicle) => ({
        ...vehicle,
        claim: vehicle.portalClaims[0] || null,
        portalClaims: undefined,
      })),
    };
  } catch (error) {
    console.error("Gabim gjatë kërkimit të automjetit:", error);

    return {
      success: false,
      message: "Ndodhi një gabim gjatë kërkimit.",
      vehicles: [],
    };
  }
}

export async function createVehicleClaim(
  customerVehicleId,
  vehicleId,
  message,
) {
  try {
    const { profileId } = await requireCustomerActionContext();

    const customerVehicle = await db.customerVehicle.findFirst({
      where: {
        id: customerVehicleId,
        profileId,
      },

      select: {
        id: true,
        plate: true,
        vin: true,
      },
    });

    if (!customerVehicle) {
      return {
        success: false,
        message: "Automjeti yt nuk u gjet.",
      };
    }

    const workshopVehicle = await db.vehicle.findFirst({
      where: {
        id: vehicleId,
        business: {
          isActive: true,
        },
      },

      select: {
        id: true,
        plate: true,
        vin: true,
      },
    });

    if (!workshopVehicle) {
      return {
        success: false,
        message: "Automjeti i servisit nuk u gjet.",
      };
    }

    const customerPlate = normalizePlate(customerVehicle.plate);
    const workshopPlate = normalizePlate(workshopVehicle.plate);

    const customerVin = normalizeVin(customerVehicle.vin);
    const workshopVin = normalizeVin(workshopVehicle.vin);

    const plateMatches =
      customerPlate && workshopPlate && customerPlate === workshopPlate;

    const vinMatches =
      customerVin && workshopVin && customerVin === workshopVin;

    if (!plateMatches && !vinMatches) {
      return {
        success: false,
        message:
          "Targa ose VIN-i i automjetit nuk përputhet me regjistrimin e servisit.",
      };
    }

    const existingClaim = await db.vehicleClaim.findUnique({
      where: {
        customerVehicleId_vehicleId: {
          customerVehicleId,
          vehicleId,
        },
      },
    });

    if (existingClaim?.status === "APPROVED") {
      return {
        success: false,
        message: "Ky automjet është lidhur tashmë me këtë servis.",
      };
    }

    if (existingClaim?.status === "PENDING") {
      return {
        success: false,
        message: "Kërkesa është dërguar dhe pret miratimin e servisit.",
      };
    }

    const cleanMessage = String(message || "").trim();

    await db.vehicleClaim.upsert({
      where: {
        customerVehicleId_vehicleId: {
          customerVehicleId,
          vehicleId,
        },
      },

      update: {
        status: "PENDING",
        customerMessage: cleanMessage || null,
        rejectionReason: null,
        reviewedAt: null,
      },

      create: {
        customerVehicleId,
        vehicleId,
        status: "PENDING",
        customerMessage: cleanMessage || null,
      },
    });

    revalidatePath(`/customer/vehicles/${customerVehicleId}`);
    revalidatePath(`/customer/vehicles/${customerVehicleId}/claim`);
    revalidatePath("/customer/services");

    return {
      success: true,
      message:
        "Kërkesa u dërgua. Servisi duhet ta miratojë para se të shfaqet historiku.",
    };
  } catch (error) {
    console.error("Gabim gjatë krijimit të kërkesës:", error);

    if (error?.code === "P2002") {
      return {
        success: false,
        message: "Kjo kërkesë ekziston tashmë.",
      };
    }

    return {
      success: false,
      message: "Ndodhi një gabim gjatë dërgimit të kërkesës.",
    };
  }
}

export async function cancelVehicleClaim(claimId) {
  try {
    const { profileId } = await requireCustomerActionContext();

    const claim = await db.vehicleClaim.findFirst({
      where: {
        id: claimId,
        status: "PENDING",

        customerVehicle: {
          profileId,
        },
      },

      select: {
        id: true,
        customerVehicleId: true,
      },
    });

    if (!claim) {
      return {
        success: false,
        message: "Kërkesa nuk u gjet ose nuk mund të anulohet.",
      };
    }

    await db.vehicleClaim.delete({
      where: {
        id: claim.id,
      },
    });

    revalidatePath(`/customer/vehicles/${claim.customerVehicleId}`);
    revalidatePath(`/customer/vehicles/${claim.customerVehicleId}/claim`);

    return {
      success: true,
      message: "Kërkesa u anulua.",
    };
  } catch (error) {
    console.error("Gabim gjatë anulimit të kërkesës:", error);

    return {
      success: false,
      message: "Kërkesa nuk mund të anulohej.",
    };
  }
}
