import Link from "next/link";
import { ArrowRight, CarFront, LayoutDashboard, LogOut } from "lucide-react";

import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth-actions";
import LandingNavigationLinks from "@/components/landing/LandingNavigationLinks";
import MobileNavigation from "@/components/landing/MobileNavigation";

function getDashboardDestination(user) {
  if (user?.globalRole === "PLATFORM_ADMIN") {
    return {
      href: "/admin",
      label: "Administrimi",
    };
  }

  if (user?.globalRole === "CUSTOMER") {
    return {
      href: "/customer/dashboard",
      label: "Portali i klientit",
    };
  }

  if (user?.businessId && user?.businessRole) {
    return {
      href: "/dashboard",
      label: "Paneli i biznesit",
    };
  }

  return null;
}

export default async function Header() {
  const session = await auth();

  const destination = getDashboardDestination(session?.user);

  return (
    <header className="sticky top-0 z-[70] w-full border-b border-slate-200/70 bg-white/95 backdrop-blur-2xl">
      <div className="mx-auto flex h-[76px] w-full max-w-[1440px] items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="AutoFlow - Faqja kryesore"
          className="group flex shrink-0 items-center gap-3"
        >
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 transition-transform duration-300 group-hover:scale-110" />

            <CarFront size={21} className="relative z-10" />
          </div>

          <div className="leading-none">
            <span className="block text-lg font-black tracking-[-0.03em] text-slate-950">
              AutoFlow
            </span>

            <span className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.17em] text-slate-400 sm:block">
              Automotive platform
            </span>
          </div>
        </Link>

        <nav
          aria-label="Navigimi kryesor"
          className="hidden items-center gap-1 lg:flex"
        >
          <LandingNavigationLinks />
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {session?.user && destination ? (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href={destination.href}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <LayoutDashboard size={17} />
                {destination.label}
              </Link>

              <form action={logoutAction}>
                <button
                  type="submit"
                  aria-label="Dil nga llogaria"
                  title="Dil nga llogaria"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={17} />
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-bold text-slate-700 transition duration-200 hover:bg-slate-100 hover:text-slate-950"
              >
                Hyr
              </Link>

              <Link
                href="/apply"
                className="group inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Apliko tani
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          )}

          <MobileNavigation destination={destination} />
        </div>
      </div>
    </header>
  );
}
