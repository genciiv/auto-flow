import { NextResponse } from "next/server";

import { auth } from "@/auth";

function getDestination(user) {
  if (user?.globalRole === "PLATFORM_ADMIN") {
    return "/admin";
  }

  /*
   * Aksesi në biznes ka përparësi ndaj portalit
   * të klientit.
   */
  if (user?.businessId && user?.businessRole) {
    return "/dashboard";
  }

  if (user?.globalRole === "CUSTOMER") {
    return "/customer/dashboard";
  }

  return "/login?error=no-access";
}

async function redirectUser(request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const destination = getDestination(session.user);

  return NextResponse.redirect(new URL(destination, request.url), 303);
}

export async function GET(request) {
  return redirectUser(request);
}

export async function POST(request) {
  return redirectUser(request);
}
