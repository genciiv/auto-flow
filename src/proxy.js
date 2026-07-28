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

  return null;
}

export default auth((request) => {
  /*
   * Server Actions nuk duhet të ridrejtohen nga proxy.
   * Përndryshe Next.js merr HTML redirect në vend të
   * përgjigjes së Server Action-it.
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
   * Përdorues i paidentifikuar që kërkon faqe private.
   */
  if (!isLoggedIn && (isAdminRoute || isDashboardRoute || isCustomerRoute)) {
    return redirectToLogin(request);
  }

  /*
   * Përdorues i identifikuar që hap login/register.
   */
  if (isAuthenticationRoute && isLoggedIn) {
    const destination = getAuthenticatedDestination(user);

    if (destination) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  /*
   * Vetëm platform admin mund të hapë /admin.
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
   * Vetëm përdoruesit me BusinessUser aktiv mund
   * të hapin dashboard-in e biznesit.
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
   * Portali i klientit lejohet vetëm për CUSTOMER.
   * Një CUSTOMER që ka edhe biznes mund ta hapë
   * këtë portal manualisht.
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
