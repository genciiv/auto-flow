import { db } from "@/lib/db";

const VALID_FILTERS = ["ALL", "UNREAD", "READ"];

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getStartOfToday() {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
}

function getStartOfMonth() {
  const date = new Date();

  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildInquiryWhere({ businessId, search = "", status = "ALL" }) {
  const normalizedSearch = normalizeText(search);

  const normalizedStatus = VALID_FILTERS.includes(status) ? status : "ALL";

  return {
    listing: {
      businessId,
    },

    ...(normalizedStatus === "UNREAD"
      ? {
          isRead: false,
        }
      : {}),

    ...(normalizedStatus === "READ"
      ? {
          isRead: true,
        }
      : {}),

    ...(normalizedSearch
      ? {
          OR: [
            {
              name: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              phone: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              message: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              listing: {
                title: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };
}

export async function getMarketplaceInquiries({
  businessId,
  search = "",
  status = "ALL",
}) {
  const where = buildInquiryWhere({
    businessId,
    search,
    status,
  });

  return db.marketplaceInquiry.findMany({
    where,

    include: {
      listing: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          type: true,
          price: true,

          images: {
            orderBy: {
              position: "asc",
            },
            take: 1,
          },
        },
      },

      senderUser: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },

    orderBy: [
      {
        isRead: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}

export async function getMarketplaceInquiryStats(businessId) {
  const startOfToday = getStartOfToday();
  const startOfMonth = getStartOfMonth();

  const listingFilter = {
    listing: {
      businessId,
    },
  };

  const [total, unread, today, thisMonth] = await Promise.all([
    db.marketplaceInquiry.count({
      where: listingFilter,
    }),

    db.marketplaceInquiry.count({
      where: {
        ...listingFilter,
        isRead: false,
      },
    }),

    db.marketplaceInquiry.count({
      where: {
        ...listingFilter,

        createdAt: {
          gte: startOfToday,
        },
      },
    }),

    db.marketplaceInquiry.count({
      where: {
        ...listingFilter,

        createdAt: {
          gte: startOfMonth,
        },
      },
    }),
  ]);

  return {
    total,
    unread,
    today,
    thisMonth,
  };
}
