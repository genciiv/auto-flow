import Link from "next/link";

import {
  ArrowRight,
  CarFront,
  Heart,
  MessageSquareText,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { db } from "@/lib/db";
import { requireCustomerContext } from "@/lib/customer-context";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function truncateText(value, maxLength = 95) {
  const text = String(value || "").trim();

  if (!text) {
    return "Pa mesazh";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

export const metadata = {
  title: "Përmbledhje | AutoFlow",
  description: "Menaxho automjetet, kërkesat dhe favoritet e tua në AutoFlow.",
};

export default async function CustomerDashboardPage() {
  const { user, userId, profileId } = await requireCustomerContext();

  const [
    vehicleCount,
    inquiryCount,
    favoriteCount,
    listingCount,
    latestInquiries,
  ] = await Promise.all([
    db.customerVehicle.count({
      where: {
        profileId,
      },
    }),

    db.marketplaceInquiry.count({
      where: {
        senderUserId: userId,
      },
    }),

    db.marketplaceFavorite.count({
      where: {
        userId,
      },
    }),

    db.marketplaceListing.count({
      where: {
        sellerUserId: userId,
      },
    }),

    db.marketplaceInquiry.findMany({
      where: {
        senderUserId: userId,
      },

      select: {
        id: true,
        name: true,
        message: true,
        createdAt: true,

        listing: {
          select: {
            title: true,
            slug: true,
            status: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 4,
    }),
  ]);

  const firstName =
    String(user.name || "Klient")
      .trim()
      .split(" ")[0] || "Klient";

  const stats = [
    {
      label: "Makinat e mia",
      value: vehicleCount,
      description: "Automjete të regjistruara",
      icon: CarFront,
      href: "/customer/vehicles",
    },
    {
      label: "Kërkesat e mia",
      value: inquiryCount,
      description: "Kërkesa në Marketplace",
      icon: MessageSquareText,
      href: "/customer/inquiries",
    },
    {
      label: "Favoritet",
      value: favoriteCount,
      description: "Publikime të ruajtura",
      icon: Heart,
      href: "/customer/favorites",
    },
    {
      label: "Publikimet e mia",
      value: listingCount,
      description: "Produkte të publikuara",
      icon: ShoppingBag,
      href: "/customer/listings",
    },
  ];

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
              <Sparkles size={14} />
              Portali yt personal AutoFlow
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Mirë se erdhe, {firstName}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Menaxho makinat, kërkesat, favoritet dhe publikimet e tua nga një
              vend i vetëm.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/customer/vehicles"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
              >
                <Plus size={17} />
                Shto automjet
              </Link>

              <Link
                href="/marketplace"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Shiko Marketplace
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={22} />
                </div>

                <ArrowRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                />
              </div>

              <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                {item.value}
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {item.label}
              </p>

              <p className="mt-1 text-xs text-slate-500">{item.description}</p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Kërkesat e fundit
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Kërkesat që ke dërguar në Marketplace
              </p>
            </div>

            <Link
              href="/customer/inquiries"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              Shiko të gjitha
              <ArrowRight size={16} />
            </Link>
          </div>

          {latestInquiries.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <MessageSquareText size={24} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-950">
                Nuk ke dërguar ende kërkesa
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-500">
                Kur kontakton një shitës në Marketplace, kërkesa do të shfaqet
                këtu.
              </p>

              <Link
                href="/marketplace"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-blue-600"
              >
                Shiko Marketplace
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {latestInquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  href={`/marketplace/${inquiry.listing.slug}`}
                  className="flex items-start gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <MessageSquareText size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-sm font-bold text-slate-950">
                        {inquiry.listing.title}
                      </p>

                      <span className="shrink-0 text-[11px] font-medium text-slate-400">
                        {formatDate(inquiry.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {truncateText(inquiry.message)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-950">
            Veprime të shpejta
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Akses i shpejtë te funksionet kryesore
          </p>

          <div className="mt-5 space-y-3">
            <Link
              href="/customer/vehicles"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CarFront size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-950">
                  Shto një makinë
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Regjistro automjetin tënd
                </p>
              </div>

              <ArrowRight size={17} className="text-slate-300" />
            </Link>

            <Link
              href="/marketplace"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShoppingBag size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-950">
                  Eksploro Marketplace
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Makina, pjesë dhe aksesorë
                </p>
              </div>

              <ArrowRight size={17} className="text-slate-300" />
            </Link>

            <Link
              href="/customer/profile"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Sparkles size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-950">
                  Plotëso profilin
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Përditëso të dhënat personale
                </p>
              </div>

              <ArrowRight size={17} className="text-slate-300" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
