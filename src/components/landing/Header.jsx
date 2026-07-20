import Link from "next/link";
import { Car, LayoutDashboard, LogOut } from "lucide-react";

import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth-actions";

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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Car size={22} />
          </div>

          <span className="text-xl font-bold tracking-tight">AutoFlow</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link href="/#features" className="transition hover:text-slate-950">
            Karakteristikat
          </Link>

          <Link
            href="/#marketplace"
            className="transition hover:text-slate-950"
          >
            Marketplace
          </Link>

          <Link href="/#pricing" className="transition hover:text-slate-950">
            Çmimet
          </Link>

          <Link href="/#contact" className="transition hover:text-slate-950">
            Kontakti
          </Link>
        </nav>

        {session?.user && destination ? (
          <div className="flex items-center gap-3">
            <Link
              href={destination.href}
              className="flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
            >
              <LayoutDashboard size={17} />
              {destination.label}
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Dil nga llogaria"
                className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:flex"
              >
                <LogOut size={17} />
                Dil
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:block"
            >
              Hyr
            </Link>

            <Link
              href="/apply"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Apliko tani
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
