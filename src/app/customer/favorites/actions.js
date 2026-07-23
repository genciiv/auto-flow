"use server";

import { revalidatePath } from "next/cache";

import { requireCustomerActionContext } from "@/lib/customer-context";
import { db } from "@/lib/db";

function revalidateFavoritePaths(slug) {
  revalidatePath("/marketplace");
  revalidatePath("/customer/favorites");
  revalidatePath("/customer/dashboard");

  if (slug) {
    revalidatePath(`/marketplace/${slug}`);
  }
}

export async function toggleMarketplaceFavorite(listingId) {
  try {
    const { profileId } = await requireCustomerActionContext();

    if (!listingId || typeof listingId !== "string") {
      return {
        success: false,
        isFavorite: false,
        message: "Publikimi nuk u gjet.",
      };
    }

    const profile = await db.customerProfile.findUnique({
      where: {
        id: profileId,
      },
      select: {
        userId: true,
      },
    });

    if (!profile?.userId) {
      return {
        success: false,
        isFavorite: false,
        message: "Duhet të hysh në llogari për të ruajtur favoritet.",
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
      },
    });

    if (!listing) {
      return {
        success: false,
        isFavorite: false,
        message: "Publikimi nuk ekziston ose nuk është më aktiv.",
      };
    }

    const existingFavorite = await db.marketplaceFavorite.findUnique({
      where: {
        userId_listingId: {
          userId: profile.userId,
          listingId: listing.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingFavorite) {
      await db.marketplaceFavorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });

      revalidateFavoritePaths(listing.slug);

      return {
        success: true,
        isFavorite: false,
        message: "Publikimi u hoq nga favoritet.",
      };
    }

    await db.marketplaceFavorite.create({
      data: {
        userId: profile.userId,
        listingId: listing.id,
      },
    });

    revalidateFavoritePaths(listing.slug);

    return {
      success: true,
      isFavorite: true,
      message: "Publikimi u ruajt te favoritet.",
    };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të favoritit:", error);

    return {
      success: false,
      isFavorite: false,
      message:
        error?.message || "Nuk mund të përditësohej favoriti. Provo përsëri.",
    };
  }
}
