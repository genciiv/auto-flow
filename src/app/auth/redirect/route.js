import { NextResponse } from "next/server";

import { auth } from "@/auth";

function getDestination(user) {
  if (user?.globalRole === "PLATFORM_ADMIN") {
    return "/admin";
  }

  if (user?.globalRole === "CUSTOMER") {
    return "/customer/dashboard";
  }

  if (user?.businessId && user?.businessRole) {
    return "/dashboard";
  }

  return "/login?error=no-access";
}

export async function GET(request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const destination = getDestination(session.user);

  return NextResponse.redirect(new URL(destination, request.url));
}
