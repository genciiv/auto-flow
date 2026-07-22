import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

function createPageHref({ page, search, type, city, sort }) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (type) {
    params.set("type", type);
  }

  if (city) {
    params.set("city", city);
  }

  if (sort && sort !== "NEWEST") {
    params.set("sort", sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/marketplace?${query}` : "/marketplace";
}

export default function MarketplacePagination({ pagination, filters }) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const previousHref = createPageHref({
    ...filters,
    page: pagination.page - 1,
  });

  const nextHref = createPageHref({
    ...filters,
    page: pagination.page + 1,
  });

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
      <p className="text-sm font-medium text-slate-500">
        Faqja{" "}
        <span className="font-bold text-slate-950">{pagination.page}</span> nga{" "}
        <span className="font-bold text-slate-950">
          {pagination.totalPages}
        </span>
      </p>

      <div className="flex items-center gap-3">
        {pagination.hasPreviousPage ? (
          <Link
            href={previousHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Mbrapa
          </Link>
        ) : (
          <span className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 text-sm font-bold text-slate-300">
            <ArrowLeft size={16} />
            Mbrapa
          </span>
        )}

        {pagination.hasNextPage ? (
          <Link
            href={nextHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Tjetra
            <ArrowRight size={16} />
          </Link>
        ) : (
          <span className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-bold text-slate-300">
            Tjetra
            <ArrowRight size={16} />
          </span>
        )}
      </div>
    </div>
  );
}
