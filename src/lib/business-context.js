import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function requireBusinessContext() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await db.businessUser.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
      business: {
        isActive: true,
      },
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          city: true,
          isActive: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!membership?.business) {
    redirect("/");
  }

  return {
    session,
    userId: session.user.id,
    businessId: membership.business.id,
    business: membership.business,
    role: membership.role,
  };
}
