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
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizePage(value) {
  const parsedPage = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) return 1;
  return parsedPage;
}

function getOrderBy(sort) {
  if (sort === "OLDEST") {
    return [{ publishedAt: "asc" }, { createdAt: "asc" }];
  }

  if (sort === "PRICE_HIGH") {
    return [{ price: "desc" }, { publishedAt: "desc" }];
  }

  if (sort === "PRICE_LOW") {
    return [{ price: "asc" }, { publishedAt: "desc" }];
  }

  return [{ publishedAt: "desc" }, { createdAt: "desc" }];
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
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
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

function addFavoriteState(listings, viewerUserId) {
  return listings.map((listing) => ({
    ...listing,
    isFavorite: viewerUserId ? listing.favorites?.length > 0 : false,
    favoritesCount: listing._count?.favorites || 0,
    favorites: undefined,
    _count: undefined,
  }));
}

function buildFavoriteInclude(viewerUserId) {
  return {
    favorites: viewerUserId
      ? {
          where: {
            userId: viewerUserId,
          },
          select: {
            id: true,
          },
        }
      : false,
    _count: {
      select: {
        favorites: true,
      },
    },
  };
}

export async function getPublicMarketplaceListings({
  search = "",
  type = "",
  city = "",
  sort = "NEWEST",
  page = 1,
  viewerUserId = null,
} = {}) {
  const normalizedSearch = normalizeString(search);
  const normalizedType = normalizeString(type).toUpperCase();
  const normalizedCity = normalizeString(city);
  const requestedSort = normalizeString(sort).toUpperCase();

  const normalizedSort = VALID_SORTS.includes(requestedSort)
    ? requestedSort
    : "NEWEST";

  const normalizedPage = normalizePage(page);

  const where = buildMarketplaceWhere({
    search: normalizedSearch,
    type: normalizedType,
    city: normalizedCity,
  });

  const [rawListings, totalCount] = await Promise.all([
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
        ...buildFavoriteInclude(viewerUserId),
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
    listings: addFavoriteState(rawListings, viewerUserId),
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

export async function getPublicMarketplaceListingBySlug(
  slug,
  viewerUserId = null,
) {
  const normalizedSlug = normalizeString(slug);

  if (!normalizedSlug) return null;

  const rawListing = await db.marketplaceListing.findFirst({
    where: {
      slug: normalizedSlug,
      status: "PUBLISHED",
    },
    include: {
      images: {
        orderBy: {
          position: "asc",
        },
      },
      business: {
        select: {
          id: true,
          name: true,
          city: true,
          address: true,
          phone: true,
          email: true,
          website: true,
          logo: true,
          currency: true,
          workingHours: true,
          isActive: true,
        },
      },
      sellerUser: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      ...buildFavoriteInclude(viewerUserId),
    },
  });

  if (!rawListing) return null;

  const listing = addFavoriteState([rawListing], viewerUserId)[0];

  const rawRelatedListings = await db.marketplaceListing.findMany({
    where: {
      id: {
        not: listing.id,
      },
      status: "PUBLISHED",
      type: listing.type,
    },
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
          currency: true,
        },
      },
      sellerUser: {
        select: {
          id: true,
          name: true,
        },
      },
      ...buildFavoriteInclude(viewerUserId),
    },
    orderBy: [
      { isFeatured: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    take: 4,
  });

  return {
    listing,
    relatedListings: addFavoriteState(rawRelatedListings, viewerUserId),
  };
}
