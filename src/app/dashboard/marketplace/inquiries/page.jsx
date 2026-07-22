import Link from "next/link";
import { ArrowLeft, MessageSquareText } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InquiryFilters from "@/components/marketplace/inquiries/InquiryFilters";
import InquiryStats from "@/components/marketplace/inquiries/InquiryStats";
import InquiryTable from "@/components/marketplace/inquiries/InquiryTable";

import { requireBusinessPermission } from "@/lib/business-context";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

import {
  getMarketplaceInquiries,
  getMarketplaceInquiryStats,
} from "@/services/marketplace-inquiry-service";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["ALL", "UNREAD", "READ"];

export default async function MarketplaceInquiriesPage({ searchParams }) {
  const { businessId, businessRole } = await requireBusinessPermission(
    PERMISSIONS.MARKETPLACE_VIEW,
  );

  const params = await searchParams;

  const search = typeof params?.search === "string" ? params.search.trim() : "";

  const requestedStatus =
    typeof params?.status === "string" ? params.status.toUpperCase() : "ALL";

  const status = VALID_STATUSES.includes(requestedStatus)
    ? requestedStatus
    : "ALL";

  const [inquiries, stats] = await Promise.all([
    getMarketplaceInquiries({
      businessId,
      search,
      status,
    }),

    getMarketplaceInquiryStats(businessId),
  ]);

  const canManage = hasPermission(businessRole, PERMISSIONS.MARKETPLACE_MANAGE);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <Link
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Kthehu te publikimet
          </Link>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">Marketplace</p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Kërkesat
              </h1>

              <p className="mt-2 text-slate-500">
                Shiko dhe menaxho mesazhet e dërguara nga personat e interesuar
                për publikimet e biznesit.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
              <MessageSquareText size={17} className="text-blue-600" />
              {stats.unread}{" "}
              {stats.unread === 1
                ? "kërkesë e palexuar"
                : "kërkesa të palexuara"}
            </div>
          </div>
        </div>

        <InquiryStats stats={stats} />

        <InquiryFilters search={search} status={status} />

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            {inquiries.length}{" "}
            {inquiries.length === 1 ? "kërkesë u gjet" : "kërkesa u gjetën"}
          </p>
        </div>

        <InquiryTable inquiries={inquiries} canManage={canManage} />
      </div>
    </DashboardLayout>
  );
}
