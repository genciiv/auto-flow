"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Car, FileSearch } from "lucide-react";

import VehicleFilters from "@/components/vehicles/VehicleFilters";
import VehicleRowActions from "@/components/vehicles/VehicleRowActions";

const statusConfig = {
  ACTIVE: {
    label: "Aktiv",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  IN_SERVICE: {
    label: "Në servis",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  PENDING: {
    label: "Në pritje",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("sq-AL");
}

function getVehicleStatus(vehicle) {
  const services = vehicle.services || [];
  const latestService = services[0] || null;

  if (latestService?.status === "IN_PROGRESS") {
    return "IN_SERVICE";
  }

  if (latestService?.status === "PENDING") {
    return "PENDING";
  }

  return "ACTIVE";
}

function getVehicleSearchText(vehicle) {
  return normalizeText(
    [
      vehicle.id,
      vehicle.plate,
      vehicle.brand,
      vehicle.model,
      vehicle.year,
      vehicle.vin,
      vehicle.customer?.name,
      vehicle.customer?.phone,
      vehicle.customer?.email,
      vehicle.customer?.city,
      ...(vehicle.services || []).map((service) => service.title),
      ...(vehicle.services || []).map((service) => service.description),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function sortVehicles(vehicles, sort) {
  const sortedVehicles = [...vehicles];

  if (sort === "OLDEST") {
    return sortedVehicles.sort((first, second) => {
      return (
        new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime()
      );
    });
  }

  if (sort === "PLATE_ASC") {
    return sortedVehicles.sort((first, second) => {
      return String(first.plate || "").localeCompare(
        String(second.plate || ""),
        "sq-AL",
        {
          numeric: true,
          sensitivity: "base",
        },
      );
    });
  }

  if (sort === "PLATE_DESC") {
    return sortedVehicles.sort((first, second) => {
      return String(second.plate || "").localeCompare(
        String(first.plate || ""),
        "sq-AL",
        {
          numeric: true,
          sensitivity: "base",
        },
      );
    });
  }

  if (sort === "BRAND_ASC") {
    return sortedVehicles.sort((first, second) => {
      const firstName = [first.brand, first.model].filter(Boolean).join(" ");

      const secondName = [second.brand, second.model].filter(Boolean).join(" ");

      return firstName.localeCompare(secondName, "sq-AL", {
        sensitivity: "base",
      });
    });
  }

  if (sort === "YEAR_DESC") {
    return sortedVehicles.sort((first, second) => {
      return Number(second.year || 0) - Number(first.year || 0);
    });
  }

  if (sort === "YEAR_ASC") {
    return sortedVehicles.sort((first, second) => {
      return Number(first.year || 0) - Number(second.year || 0);
    });
  }

  return sortedVehicles.sort((first, second) => {
    return (
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    );
  });
}

export default function VehiclesTable({ vehicles = [], customers = [] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");

  const deferredSearch = useDeferredValue(search);

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = normalizeText(deferredSearch);

    const filtered = vehicles.filter((vehicle) => {
      const vehicleStatus = getVehicleStatus(vehicle);

      const matchesStatus = status === "ALL" || vehicleStatus === status;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getVehicleSearchText(vehicle).includes(normalizedSearch);
    });

    return sortVehicles(filtered, sort);
  }, [vehicles, deferredSearch, status, sort]);

  const hasActiveFilters =
    search.trim() !== "" || status !== "ALL" || sort !== "NEWEST";

  function handleResetFilters() {
    setSearch("");
    setStatus("ALL");
    setSort("NEWEST");
  }

  return (
    <div className="space-y-5">
      <VehicleFilters
        search={search}
        status={status}
        sort={sort}
        resultCount={filteredVehicles.length}
        totalCount={vehicles.length}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onReset={handleResetFilters}
      />

      {vehicles.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Car className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nuk ka ende automjete
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Shto automjetin e parë për të menaxhuar pronarin dhe historikun e
            shërbimeve.
          </p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <FileSearch className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nuk u gjet asnjë automjet
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
                Lista e automjeteve
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Po shfaqen {filteredVehicles.length} nga {vehicles.length}{" "}
                automjete.
              </p>
            </div>

            {hasActiveFilters && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                Filtra aktivë
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Targa</th>
                  <th className="px-6 py-4">Automjeti</th>
                  <th className="px-6 py-4">Pronari</th>
                  <th className="px-6 py-4">VIN</th>
                  <th className="px-6 py-4">Shërbime</th>
                  <th className="px-6 py-4">Statusi</th>
                  <th className="px-6 py-4 text-right">Veprime</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredVehicles.map((vehicle) => {
                  const services = vehicle.services || [];
                  const vehicleStatus = getVehicleStatus(vehicle);

                  const statusDetails =
                    statusConfig[vehicleStatus] || statusConfig.ACTIVE;

                  return (
                    <tr
                      key={vehicle.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-6 py-5">
                        <p className="text-sm font-semibold text-slate-950">
                          {vehicle.plate}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <p className="text-sm font-semibold text-slate-950">
                          {[vehicle.brand, vehicle.model]
                            .filter(Boolean)
                            .join(" ")}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {vehicle.year || "Pa vit"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-700">
                          {vehicle.customer?.name || "Pa pronar"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {vehicle.customer?.phone ||
                            vehicle.customer?.email ||
                            "Pa kontakt"}
                        </p>
                      </td>

                      <td className="max-w-[220px] px-6 py-5 text-sm text-slate-600">
                        <span className="block truncate">
                          {vehicle.vin || "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm font-semibold text-slate-950">
                        {services.length}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusDetails.className}`}
                        >
                          {statusDetails.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <div className="flex justify-end">
                          <VehicleRowActions
                            vehicle={vehicle}
                            customers={customers}
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
