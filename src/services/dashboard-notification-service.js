import { db } from "@/lib/db";

function getCustomerName(claim) {
  return (
    [
      claim.customerVehicle?.profile?.firstName,
      claim.customerVehicle?.profile?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    claim.customerVehicle?.profile?.user?.name ||
    "Klient AutoFlow"
  );
}

function getVehicleTitle(vehicle) {
  return (
    [vehicle?.brand, vehicle?.model].filter(Boolean).join(" ") ||
    vehicle?.brand ||
    "Automjet"
  );
}

export async function getDashboardNotifications(businessId) {
  if (!businessId) {
    return {
      unreadCount: 0,
      vehicleClaimPendingCount: 0,
      notifications: [],
    };
  }

  const [
    marketplaceUnreadCount,
    inquiries,
    vehicleClaimPendingCount,
    vehicleClaims,
  ] = await Promise.all([
    db.marketplaceInquiry.count({
      where: {
        isRead: false,
        listing: {
          businessId,
        },
      },
    }),

    db.marketplaceInquiry.findMany({
      where: {
        listing: {
          businessId,
        },
      },
      select: {
        id: true,
        name: true,
        message: true,
        isRead: true,
        createdAt: true,
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            images: {
              orderBy: {
                position: "asc",
              },
              take: 1,
              select: {
                id: true,
                url: true,
                alt: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    }),

    db.vehicleClaim.count({
      where: {
        status: "PENDING",
        vehicle: {
          businessId,
        },
      },
    }),

    db.vehicleClaim.findMany({
      where: {
        status: "PENDING",
        vehicle: {
          businessId,
        },
      },
      select: {
        id: true,
        createdAt: true,
        customerMessage: true,
        customerVehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    }),
  ]);

  const marketplaceNotifications = inquiries.map((inquiry) => ({
    id: `marketplace-${inquiry.id}`,
    sourceId: inquiry.id,
    kind: "MARKETPLACE_INQUIRY",
    title: inquiry.name || "Vizitor",
    subtitle: inquiry.listing.title || "Publikim Marketplace",
    message: inquiry.message,
    isRead: inquiry.isRead,
    createdAt: inquiry.createdAt.toISOString(),
    href: `/dashboard/marketplace/inquiries?inquiry=${inquiry.id}`,
    image: inquiry.listing.images[0]?.url || null,
    listingType: inquiry.listing.type,
  }));

  const vehicleClaimNotifications = vehicleClaims.map((claim) => {
    const customerName = getCustomerName(claim);
    const vehicleTitle = getVehicleTitle(claim.vehicle);

    return {
      id: `vehicle-claim-${claim.id}`,
      sourceId: claim.id,
      kind: "VEHICLE_CLAIM",
      title: "Kërkesë për lidhjen e automjetit",
      subtitle: customerName,
      message:
        claim.customerMessage ||
        `${customerName} kërkon të lidhë ${vehicleTitle} – ${claim.vehicle.plate}.`,
      isRead: false,
      createdAt: claim.createdAt.toISOString(),
      href: `/dashboard/vehicle-claims`,
      image: null,
      vehicle: {
        title: vehicleTitle,
        plate: claim.vehicle.plate,
      },
    };
  });

  const notifications = [
    ...marketplaceNotifications,
    ...vehicleClaimNotifications,
  ]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
    .slice(0, 8);

  return {
    unreadCount: marketplaceUnreadCount + vehicleClaimPendingCount,
    vehicleClaimPendingCount,
    notifications,
  };
}
