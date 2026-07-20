import { db } from "@/lib/db";

export async function getPlatformDashboardData() {
  const [
    totalBusinesses,
    activeBusinesses,
    totalBusinessUsers,
    platformAdmins,
    totalCustomers,
    totalVehicles,
    totalServices,
    recentBusinesses,
  ] = await Promise.all([
    db.business.count(),

    db.business.count({
      where: {
        isActive: true,
      },
    }),

    db.businessUser.count({
      where: {
        isActive: true,
      },
    }),

    db.user.count({
      where: {
        globalRole: "PLATFORM_ADMIN",
        isActive: true,
      },
    }),

    db.customer.count(),

    db.vehicle.count(),

    db.serviceRecord.count(),

    db.business.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        users: {
          where: {
            role: "OWNER",
            isActive: true,
          },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            customers: true,
            vehicles: true,
            services: true,
          },
        },
      },
    }),
  ]);

  return {
    totalBusinesses,
    activeBusinesses,
    inactiveBusinesses: totalBusinesses - activeBusinesses,
    totalBusinessUsers,
    platformAdmins,
    totalCustomers,
    totalVehicles,
    totalServices,
    recentBusinesses,
  };
}
