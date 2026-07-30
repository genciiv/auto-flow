"use server";

import { revalidatePath } from "next/cache";

import { requireCustomerActionContext } from "@/lib/customer-context";
import { db } from "@/lib/db";
import { getFirstValidationMessage, validateObject } from "@/lib/validation";
import { toggleMarketplaceFavoriteSchema } from "@/schemas/favorite-schema";
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

function getFavoriteErrorResult(message) {
  return {
    success: false,
    isFavorite: false,
    favoritesCount: 0,
    message,
  };
}

function getErrorMessage(error, fallbackMessage) {
  return error instanceof Error ? error.message : fallbackMessage;
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

    const validationResult = validateObject(toggleMarketplaceFavoriteSchema, {
      listingId,
    });

    if (!validationResult.success) {
      return getFavoriteErrorResult(
        getFirstValidationMessage(
          validationResult.error,
          "Publikimi nuk u gjet.",
        ),
      );
    }

    const validatedListingId = validationResult.data.listingId;

    const listing = await db.marketplaceListing.findFirst({
      where: {
        id: validatedListingId,
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
      return getFavoriteErrorResult(
        "Publikimi nuk ekziston ose nuk është më aktiv.",
      );
    }

    const result = await db.$transaction(async (transaction) => {
      const existingFavorite = await transaction.marketplaceFavorite.findUnique(
        {
          where: {
            userId_listingId: {
              userId,
              listingId: listing.id,
            },
          },
          select: {
            id: true,
          },
        },
      );

      if (existingFavorite) {
        await transaction.marketplaceFavorite.delete({
          where: {
            id: existingFavorite.id,
          },
        });

        const favoritesCount = await transaction.marketplaceFavorite.count({
          where: {
            listingId: listing.id,
          },
        });

        return {
          isFavorite: false,
          favoritesCount,
        };
      }

      await transaction.marketplaceFavorite.create({
        data: {
          userId,
          listingId: listing.id,
        },
      });

      const favoritesCount = await transaction.marketplaceFavorite.count({
        where: {
          listingId: listing.id,
        },
      });

      return {
        isFavorite: true,
        favoritesCount,
      };
    });

    if (result.isFavorite) {
      try {
        await createFavoriteNotification({
          listing,
          actor: {
            id: userId,
            name: user?.name,
            image: user?.image,
          },
        });
      } catch (notificationError) {
        console.error(
          "Favoriti u ruajt, por njoftimi nuk u krijua:",
          notificationError,
        );
      }
    }

    revalidateFavoritePaths(listing.slug);

    return {
      success: true,
      isFavorite: result.isFavorite,
      favoritesCount: result.favoritesCount,
      message: result.isFavorite
        ? "Publikimi u ruajt te favoritet."
        : "Publikimi u hoq nga favoritet.",
    };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të favoritit:", error);

    if (error?.code === "P2002") {
      return getFavoriteErrorResult("Publikimi është tashmë te favoritet.");
    }

    return getFavoriteErrorResult(
      getErrorMessage(
        error,
        "Nuk mund të përditësohej favoriti. Provo përsëri.",
      ),
    );
  }
}
