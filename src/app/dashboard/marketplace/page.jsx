import Link from "next/link";
import { MessageSquareText, Plus } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import MarketplaceGrid from "@/components/marketplace/MarketplaceGrid";
import MarketplaceStats from "@/components/marketplace/MarketplaceStats";

import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const VALID_TYPES = [
  "VEHICLE",
  "MOTORCYCLE",
  "PART",
  "ACCESSORY",
  "SERVICE",
  "OTHER",
];

const VALID_STATUSES = ["DRAFT", "PUBLISHED", "SOLD", "ARCHIVED", "REJECTED"];

export default async function MarketplacePage({ searchParams }) {
  const { businessId, businessRole, business } =
    await requireBusinessPermission(PERMISSIONS.MARKETPLACE_VIEW);

  const params = await searchParams;

  const search = typeof params?.search === "string" ? params.search.trim() : "";

  const requestedType = typeof params?.type === "string" ? params.type : "";

  const requestedStatus =
    typeof params?.status === "string" ? params.status : "";

  const selectedType = VALID_TYPES.includes(requestedType) ? requestedType : "";

  const selectedStatus = VALID_STATUSES.includes(requestedStatus)
    ? requestedStatus
    : "";

  const where = {
    businessId,

    ...(selectedType
      ? {
          type: selectedType,
        }
      : {}),

    ...(selectedStatus
      ? {
          status: selectedStatus,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              category: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              brand: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              model: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              city: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [
    listings,
    activeListings,
    draftListings,
    vehicleListings,
    soldListings,
  ] = await Promise.all([
    db.marketplaceListing.findMany({
      where,

      include: {
        images: {
          orderBy: {
            position: "asc",
          },
          take: 1,
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    db.marketplaceListing.count({
      where: {
        businessId,
        status: "PUBLISHED",
      },
    }),

    db.marketplaceListing.count({
      where: {
        businessId,
        status: "DRAFT",
      },
    }),

    db.marketplaceListing.count({
      where: {
        businessId,
        type: "VEHICLE",
        status: "PUBLISHED",
      },
    }),

    db.marketplaceListing.aggregate({
      where: {
        businessId,
        status: "SOLD",
      },
      _sum: {
        price: true,
      },
    }),
  ]);

  const canManage = hasPermission(businessRole, PERMISSIONS.MARKETPLACE_MANAGE);

  const currency = business?.currency || "ALL";
  const soldValue = soldListings._sum.price || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Marketplace</p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Marketplace
            </h1>

            <p className="mt-2 text-slate-500">
              Menaxho pjesë këmbimi, makina, motorë, vegla dhe produkte për
              shitje.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/marketplace/inquiries"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <MessageSquareText size={18} />
              Kërkesat
            </Link>

            {canManage ? (
              <Link
                href="/dashboard/marketplace/new"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Publikim i ri
              </Link>
            ) : null}
          </div>
        </div>

        <MarketplaceStats
          activeListings={activeListings}
          draftListings={draftListings}
          vehicleListings={vehicleListings}
          soldValue={soldValue}
          currency={currency}
        />

        <MarketplaceFilters
          search={search}
          selectedType={selectedType}
          selectedStatus={selectedStatus}
        />

        {(search || selectedType || selectedStatus) && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-slate-950">
              {listings.length}{" "}
              {listings.length === 1 ? "publikim u gjet" : "publikime u gjetën"}
            </p>

            <Link
              href="/dashboard/marketplace"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Pastro filtrat
            </Link>
          </div>
        )}

        <MarketplaceGrid
          listings={listings}
          currency={currency}
          canManage={canManage}
        />
      </div>
    </DashboardLayout>
  );
}
