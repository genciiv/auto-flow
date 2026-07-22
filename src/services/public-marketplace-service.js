import { db } from "@/lib/db";

const ITEMS_PER_PAGE = 12;

const VALID_TYPES = [
  "VEHICLE",
  "MOTORCYCLE",
  "PART",
  "ACCESSORY",
  "SERVICE",
  "OTHER",
];

const VALID_SORTS = ["NEWEST", "OLDEST", "PRICE_HIGH", "PRICE_LOW"];

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizePage(value) {
  const parsedPage = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}

function getOrderBy(sort) {
  if (sort === "OLDEST") {
    return [
      {
        publishedAt: "asc",
      },
      {
        createdAt: "asc",
      },
    ];
  }

  if (sort === "PRICE_HIGH") {
    return [
      {
        price: "desc",
      },
      {
        publishedAt: "desc",
      },
    ];
  }

  if (sort === "PRICE_LOW") {
    return [
      {
        price: "asc",
      },
      {
        publishedAt: "desc",
      },
    ];
  }

  return [
    {
      publishedAt: "desc",
    },
    {
      createdAt: "desc",
    },
  ];
}

function buildMarketplaceWhere({ search, type, city }) {
  const where = {
    status: "PUBLISHED",
  };

  if (VALID_TYPES.includes(type)) {
    where.type = type;
  }

  if (city) {
    where.city = {
      contains: city,
      mode: "insensitive",
    };
  }

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        category: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        brand: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        model: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        city: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        business: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  return where;
}

export async function getPublicMarketplaceListings({
  search = "",
  type = "",
  city = "",
  sort = "NEWEST",
  page = 1,
} = {}) {
  const normalizedSearch = normalizeString(search);
  const normalizedType = normalizeString(type).toUpperCase();
  const normalizedCity = normalizeString(city);
  const normalizedSort = VALID_SORTS.includes(
    normalizeString(sort).toUpperCase(),
  )
    ? normalizeString(sort).toUpperCase()
    : "NEWEST";

  const normalizedPage = normalizePage(page);

  const where = buildMarketplaceWhere({
    search: normalizedSearch,
    type: normalizedType,
    city: normalizedCity,
  });

  const [listings, totalCount] = await Promise.all([
    db.marketplaceListing.findMany({
      where,
      include: {
        images: {
          orderBy: {
            position: "asc",
          },
          take: 1,
        },
        business: {
          select: {
            id: true,
            name: true,
            city: true,
            logo: true,
            currency: true,
            isActive: true,
          },
        },
        sellerUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: getOrderBy(normalizedSort),
      skip: (normalizedPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),

    db.marketplaceListing.count({
      where,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  return {
    listings,
    pagination: {
      page: normalizedPage,
      pageSize: ITEMS_PER_PAGE,
      totalCount,
      totalPages,
      hasPreviousPage: normalizedPage > 1,
      hasNextPage: normalizedPage < totalPages,
    },
    filters: {
      search: normalizedSearch,
      type: normalizedType,
      city: normalizedCity,
      sort: normalizedSort,
    },
  };
}
