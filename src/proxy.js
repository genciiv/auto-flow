import { NextResponse } from "next/server";

import { auth } from "@/auth";

function redirectToLogin(request) {
  const loginUrl = new URL("/login", request.url);

  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

function getAuthenticatedDestination(user) {
  if (user?.globalRole === "PLATFORM_ADMIN") {
    return "/admin";
  }

  if (user?.globalRole === "CUSTOMER") {
    return "/customer/dashboard";
  }

  if (user?.businessId && user?.businessRole) {
    return "/dashboard";
  }

  return null;
}

export default auth((request) => {
  const pathname = request.nextUrl.pathname;

  const user = request.auth?.user;

  const isLoggedIn = Boolean(user);

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  const isDashboardRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  const isCustomerRoute =
    pathname === "/customer" || pathname.startsWith("/customer/");

  const isLoginRoute = pathname === "/login";

  const isRegisterRoute = pathname === "/register";

  const isAuthenticationRoute = isLoginRoute || isRegisterRoute;

  if (!isLoggedIn && (isAdminRoute || isDashboardRoute || isCustomerRoute)) {
    return redirectToLogin(request);
  }

  if (isAuthenticationRoute && isLoggedIn) {
    const destination = getAuthenticatedDestination(user);

    if (destination) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  if (isAdminRoute && user?.globalRole !== "PLATFORM_ADMIN") {
    if (user?.globalRole === "CUSTOMER") {
      return NextResponse.redirect(new URL("/customer/dashboard", request.url));
    }

    if (user?.businessId && user?.businessRole) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isDashboardRoute) {
    const hasBusinessAccess =
      Boolean(user?.businessId) && Boolean(user?.businessRole);

    if (!hasBusinessAccess) {
      if (user?.globalRole === "PLATFORM_ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      if (user?.globalRole === "CUSTOMER") {
        return NextResponse.redirect(
          new URL("/customer/dashboard", request.url),
        );
      }

      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isCustomerRoute && user?.globalRole !== "CUSTOMER") {
    if (user?.globalRole === "PLATFORM_ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (user?.businessId && user?.businessRole) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/register",
    "/admin/:path*",
    "/dashboard/:path*",
    "/customer/:path*",
  ],
};
