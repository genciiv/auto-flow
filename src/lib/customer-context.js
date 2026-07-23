import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";

async function getOrCreateCustomerProfile(userId) {
  return db.customerProfile.upsert({
    where: {
      userId,
    },

    update: {},

    create: {
      userId,
    },

    include: {
      _count: {
        select: {
          vehicles: true,
        },
      },
    },
  });
}

export async function requireCustomerContext() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.globalRole === "PLATFORM_ADMIN") {
    redirect("/admin");
  }

  if (session.user.globalRole !== "CUSTOMER") {
    if (session.user.businessId && session.user.businessRole) {
      redirect("/dashboard");
    }

    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },

    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      globalRole: true,
      isActive: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,

      _count: {
        select: {
          marketplaceFavorites: true,
          marketplaceInquiries: true,
          marketplaceListings: true,
        },
      },
    },
  });

  if (!user?.isActive || user.globalRole !== "CUSTOMER") {
    redirect("/login");
  }

  const profile = await getOrCreateCustomerProfile(user.id);

  return {
    session,
    user,
    profile,
    userId: user.id,
    profileId: profile.id,
  };
}

export async function requireCustomerActionContext() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Duhet të jeni të identifikuar.");
  }

  if (session.user.globalRole !== "CUSTOMER") {
    throw new Error("Nuk keni leje për të kryer këtë veprim.");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },

    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      globalRole: true,
      isActive: true,
    },
  });

  if (!user?.isActive || user.globalRole !== "CUSTOMER") {
    throw new Error("Llogaria nuk është aktive.");
  }

  const profile = await getOrCreateCustomerProfile(user.id);

  return {
    session,
    user,
    profile,
    userId: user.id,
    profileId: profile.id,
  };
}
