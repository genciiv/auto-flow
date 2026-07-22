import { db } from "@/lib/db";

export async function getDashboardNotifications(businessId) {
  if (!businessId) {
    return {
      unreadCount: 0,
      notifications: [],
    };
  }

  const [unreadCount, inquiries] = await Promise.all([
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

      take: 5,
    }),
  ]);

  return {
    unreadCount,

    notifications: inquiries.map((inquiry) => ({
      id: inquiry.id,
      name: inquiry.name,
      message: inquiry.message,
      isRead: inquiry.isRead,
      createdAt: inquiry.createdAt.toISOString(),

      listing: {
        id: inquiry.listing.id,
        title: inquiry.listing.title,
        slug: inquiry.listing.slug,
        type: inquiry.listing.type,
        image: inquiry.listing.images[0]?.url || null,
      },
    })),
  };
}
