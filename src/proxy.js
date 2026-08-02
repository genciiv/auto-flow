import { NextResponse } from "next/server";

import { auth } from "@/auth";

function redirectToLogin(request) {
  const loginUrl = new URL("/login", request.url);

  loginUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(loginUrl);
}

function getAuthenticatedDestination(user) {
  if (user?.loginPortal === "personal") {
    return user?.globalRole === "CUSTOMER"
      ? "/customer/dashboard"
      : null;
  }

  if (user?.globalRole === "PLATFORM_ADMIN") {
    return "/admin";
  }

  if (user?.businessId && user?.businessRole) {
    return "/dashboard";
  }

  if (user?.globalRole === "CUSTOMER") {
    return "/customer/dashboard";
  }

  return null;
}

export default auth((request) => {
  /*
   * Server Actions nuk duhet tÃ« ridrejtohen nga proxy.
   * PÃ«rndryshe Next.js merr HTML redirect nÃ« vend tÃ«
   * pÃ«rgjigjes sÃ« Server Action-it.
   */
  const isServerAction =
    request.method === "POST" && request.headers.has("next-action");

  if (isServerAction) {
    return NextResponse.next();
  }

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

  /*
   * PÃ«rdorues i paidentifikuar qÃ« kÃ«rkon faqe private.
   */
  if (!isLoggedIn && (isAdminRoute || isDashboardRoute || isCustomerRoute)) {
    return redirectToLogin(request);
  }

  /*
   * PÃ«rdorues i identifikuar qÃ« hap login/register.
   */
  if (isAuthenticationRoute && isLoggedIn) {
    const destination = getAuthenticatedDestination(user);

    if (destination) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  /*
   * VetÃ«m platform admin mund tÃ« hapÃ« /admin.
   */
  if (isAdminRoute && user?.globalRole !== "PLATFORM_ADMIN") {
    if (user?.businessId && user?.businessRole) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (user?.globalRole === "CUSTOMER") {
      return NextResponse.redirect(new URL("/customer/dashboard", request.url));
    }

    return redirectToLogin(request);
  }

  /*
   * VetÃ«m pÃ«rdoruesit me BusinessUser aktiv mund
   * tÃ« hapin dashboard-in e biznesit.
   */
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

      return redirectToLogin(request);
    }
  }

  /*
   * Portali i klientit lejohet vetÃ«m pÃ«r CUSTOMER.
   * NjÃ« CUSTOMER qÃ« ka edhe biznes mund ta hapÃ«
   * kÃ«tÃ« portal manualisht.
   */
  if (isCustomerRoute && user?.globalRole !== "CUSTOMER") {
    if (user?.globalRole === "PLATFORM_ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (user?.businessId && user?.businessRole) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return redirectToLogin(request);
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

