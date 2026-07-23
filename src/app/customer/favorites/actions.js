"use server";

import { revalidatePath } from "next/cache";

import { requireCustomerActionContext } from "@/lib/customer-context";
import { db } from "@/lib/db";
import {
  createBusinessNotification,
  createCustomerNotification,
} from "@/services/notification-service";

function revalidateFavoritePaths(slug) {
  revalidatePath("/marketplace");
  revalidatePath("/customer/favorites");
  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/listings");
  revalidatePath("/customer", "layout");

  if (slug) {
    revalidatePath(`/marketplace/${slug}`);
  }
}

async function createFavoriteNotification({ listing, actor }) {
  const sellerUserId = listing.sellerUserId;
  const businessId = listing.businessId;

  if (sellerUserId && sellerUserId === actor.id) {
    return;
  }

  const notificationData = {
    title: "Publikim i ri te Favoritet",
    message: `${actor.name || "Një përdorues"} shtoi “${
      listing.title
    }” te Favoritet.`,
    type: "INFO",
    entityType: "MARKETPLACE",
    entityId: listing.id,
    actorUserId: actor.id,
    actorName: actor.name || "Përdorues i AutoFlow",
    actorAvatar: actor.image || null,
    href: `/marketplace/${listing.slug}`,
  };

  if (sellerUserId) {
    await createCustomerNotification({
      ...notificationData,
      userId: sellerUserId,
    });

    return;
  }

  if (businessId) {
    await createBusinessNotification({
      ...notificationData,
      businessId,
    });
  }
}

export async function toggleMarketplaceFavorite(listingId) {
  try {
    const { userId, user } = await requireCustomerActionContext();

    if (!listingId || typeof listingId !== "string") {
      return {
        success: false,
        isFavorite: false,
        favoritesCount: 0,
        message: "Publikimi nuk u gjet.",
      };
    }

    const listing = await db.marketplaceListing.findFirst({
      where: {
        id: listingId,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        sellerUserId: true,
        businessId: true,
      },
    });

    if (!listing) {
      return {
        success: false,
        isFavorite: false,
        favoritesCount: 0,
        message: "Publikimi nuk ekziston ose nuk është më aktiv.",
      };
    }

    const existingFavorite = await db.marketplaceFavorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId: listing.id,
        },
      },
      select: {
        id: true,
      },
    });

    let isFavorite = false;

    if (existingFavorite) {
      await db.marketplaceFavorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
    } else {
      await db.marketplaceFavorite.create({
        data: {
          userId,
          listingId: listing.id,
        },
      });

      isFavorite = true;

      await createFavoriteNotification({
        listing,
        actor: {
          id: user.id,
          name: user.name,
        },
      });
    }

    const favoritesCount = await db.marketplaceFavorite.count({
      where: {
        listingId: listing.id,
      },
    });

    revalidateFavoritePaths(listing.slug);

    return {
      success: true,
      isFavorite,
      favoritesCount,
      message: isFavorite
        ? "Publikimi u ruajt te favoritet."
        : "Publikimi u hoq nga favoritet.",
    };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të favoritit:", error);

    return {
      success: false,
      isFavorite: false,
      favoritesCount: 0,
      message:
        error?.message || "Nuk mund të përditësohej favoriti. Provo përsëri.",
    };
  }
}
