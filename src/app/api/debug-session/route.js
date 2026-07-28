import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({
      authenticated: false,
      session: null,
      databaseUser: null,
    });
  }

  const databaseUser = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      globalRole: true,
      isActive: true,
      sessionVersion: true,

      businesses: {
        where: {
          isActive: true,
          business: {
            isActive: true,
          },
        },
        select: {
          id: true,
          businessId: true,
          role: true,
          isActive: true,
          business: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    authenticated: true,
    sessionUser: session.user,
    databaseUser,
  });
}
