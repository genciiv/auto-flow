"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { FileSearch, Wrench } from "lucide-react";

import AddServicePartModal from "@/components/services/AddServicePartModal";
import CompleteServiceModal from "@/components/services/CompleteServiceModal";
import ServiceFilters from "@/components/services/ServiceFilters";
import ServicePartsList from "@/components/services/ServicePartsList";
import ServiceRowActions from "@/components/services/ServiceRowActions";
import { formatCurrency } from "@/lib/formatters";

const statusConfig = {
  PENDING: {
    label: "Në pritje",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  IN_PROGRESS: {
    label: "Në proces",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  COMPLETED: {
    label: "Përfunduar",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CANCELLED: {
    label: "Anuluar",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("sq-AL");
}

function getServiceSearchText(service) {
  return normalizeText(
    [
      service.id,
      service.title,
      service.description,
      service.status,
      service.vehicle?.plate,
      service.vehicle?.brand,
      service.vehicle?.model,
      service.vehicle?.customer?.name,
      service.business?.name,
      ...(service.partsUsed || []).map((usage) => usage.part?.name),
      ...(service.partsUsed || []).map((usage) => usage.part?.code),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function sortServices(services, sort) {
  const sortedServices = [...services];

  if (sort === "OLDEST") {
    return sortedServices.sort((first, second) => {
      return (
        new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime()
      );
    });
  }

  if (sort === "TOTAL_HIGH") {
    return sortedServices.sort((first, second) => {
      return Number(second.total || 0) - Number(first.total || 0);
    });
  }

  if (sort === "TOTAL_LOW") {
    return sortedServices.sort((first, second) => {
      return Number(first.total || 0) - Number(second.total || 0);
    });
  }

  if (sort === "TITLE_ASC") {
    return sortedServices.sort((first, second) => {
      return String(first.title || "").localeCompare(
        String(second.title || ""),
        "sq-AL",
        {
          sensitivity: "base",
        },
      );
    });
  }

  return sortedServices.sort((first, second) => {
    return (
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    );
  });
}

export default function ServicesTable({
  services = [],
  vehicles = [],
  parts = [],
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");

  const deferredSearch = useDeferredValue(search);

  const filteredServices = useMemo(() => {
    const normalizedSearch = normalizeText(deferredSearch);

    const filtered = services.filter((service) => {
      const matchesStatus = status === "ALL" || service.status === status;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getServiceSearchText(service).includes(normalizedSearch);
    });

    return sortServices(filtered, sort);
  }, [services, deferredSearch, status, sort]);

  const hasActiveFilters =
    search.trim() !== "" || status !== "ALL" || sort !== "NEWEST";

  function handleResetFilters() {
    setSearch("");
    setStatus("ALL");
    setSort("NEWEST");
  }

  return (
    <div className="space-y-5">
      <ServiceFilters
        search={search}
        status={status}
        sort={sort}
        resultCount={filteredServices.length}
        totalCount={services.length}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onReset={handleResetFilters}
      />

      {services.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Wrench className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nuk ka ende shërbime
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Krijo shërbimin e parë për të regjistruar punët dhe riparimet.
          </p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <FileSearch className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nuk u gjet asnjë shërbim
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Ndrysho termin e kërkimit ose pastro filtrat aktivë.
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Pastro filtrat
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Lista e shërbimeve
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Po shfaqen {filteredServices.length} nga {services.length}{" "}
                shërbime.
              </p>
            </div>

            {hasActiveFilters && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                Filtra aktivë
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Automjeti</th>
                  <th className="px-6 py-4">Përshkrimi</th>
                  <th className="px-6 py-4">Biznesi</th>
                  <th className="px-6 py-4">Totali</th>
                  <th className="px-6 py-4">Statusi</th>
                  <th className="px-6 py-4 text-right">Veprime</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredServices.map((service) => {
                  const statusDetails =
                    statusConfig[service.status] || statusConfig.PENDING;

                  return (
                    <tr
                      key={service.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-6 py-5">
                        <span className="text-sm font-semibold text-blue-600">
                          {String(service.id).slice(0, 8).toUpperCase()}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <p className="text-sm font-semibold text-slate-900">
                          {[service.vehicle?.brand, service.vehicle?.model]
                            .filter(Boolean)
                            .join(" ") || "Pa automjet"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {service.vehicle?.plate || "Pa targë"}
                        </p>
                      </td>

                      <td className="max-w-[320px] px-6 py-5">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {service.title}
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {service.description || "Pa përshkrim"}
                        </p>

                        <ServicePartsList parts={service.partsUsed || []} />
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">
                        {service.business?.name || "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm font-semibold text-slate-900">
                        {formatCurrency(service.total)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusDetails.className}`}
                        >
                          {statusDetails.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <CompleteServiceModal service={service} />

                          <AddServicePartModal
                            serviceId={service.id}
                            parts={parts}
                          />

                          <ServiceRowActions
                            service={service}
                            vehicles={vehicles}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
