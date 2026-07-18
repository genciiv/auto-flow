"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { CalendarDays, FileSearch } from "lucide-react";

import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import AppointmentRowActions from "@/components/appointments/AppointmentRowActions";

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

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const day = padNumber(date.getDate());
  const month = padNumber(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = padNumber(date.getHours());
  const minutes = padNumber(date.getMinutes());

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

function getLocalDayKey(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    padNumber(date.getMonth() + 1),
    padNumber(date.getDate()),
  ].join("-");
}

function getAppointmentSearchText(appointment) {
  return normalizeText(
    [
      appointment.id,
      appointment.title,
      appointment.description,
      appointment.status,
      appointment.customer?.name,
      appointment.customer?.phone,
      appointment.customer?.email,
      appointment.customer?.city,
      appointment.vehicle?.plate,
      appointment.vehicle?.brand,
      appointment.vehicle?.model,
      appointment.vehicle?.vin,
      appointment.business?.name,
      appointment.business?.city,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function sortAppointments(appointments, sort) {
  const sortedAppointments = [...appointments];

  if (sort === "LATEST") {
    return sortedAppointments.sort((first, second) => {
      return new Date(second.date).getTime() - new Date(first.date).getTime();
    });
  }

  if (sort === "NEWEST_CREATED") {
    return sortedAppointments.sort((first, second) => {
      return (
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
      );
    });
  }

  if (sort === "OLDEST_CREATED") {
    return sortedAppointments.sort((first, second) => {
      return (
        new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime()
      );
    });
  }

  if (sort === "TITLE_ASC") {
    return sortedAppointments.sort((first, second) => {
      return String(first.title || "").localeCompare(
        String(second.title || ""),
        "sq-AL",
        {
          sensitivity: "base",
        },
      );
    });
  }

  return sortedAppointments.sort((first, second) => {
    return new Date(first.date).getTime() - new Date(second.date).getTime();
  });
}

export default function AppointmentsTable({
  appointments = [],
  customers = [],
  vehicles = [],
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [sort, setSort] = useState("UPCOMING");

  const deferredSearch = useDeferredValue(search);

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = normalizeText(deferredSearch);
    const now = new Date();
    const todayKey = getLocalDayKey(now);

    const filtered = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      const appointmentDayKey = getLocalDayKey(appointment.date);

      const matchesStatus = status === "ALL" || appointment.status === status;

      if (!matchesStatus) {
        return false;
      }

      const matchesDate =
        dateFilter === "ALL" ||
        (dateFilter === "TODAY" && appointmentDayKey === todayKey) ||
        (dateFilter === "UPCOMING" &&
          appointmentDate.getTime() >= now.getTime()) ||
        (dateFilter === "PAST" && appointmentDate.getTime() < now.getTime());

      if (!matchesDate) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getAppointmentSearchText(appointment).includes(normalizedSearch);
    });

    return sortAppointments(filtered, sort);
  }, [appointments, deferredSearch, status, dateFilter, sort]);

  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "ALL" ||
    dateFilter !== "ALL" ||
    sort !== "UPCOMING";

  function handleResetFilters() {
    setSearch("");
    setStatus("ALL");
    setDateFilter("ALL");
    setSort("UPCOMING");
  }

  return (
    <div className="space-y-5">
      <AppointmentFilters
        search={search}
        status={status}
        dateFilter={dateFilter}
        sort={sort}
        resultCount={filteredAppointments.length}
        totalCount={appointments.length}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onDateFilterChange={setDateFilter}
        onSortChange={setSort}
        onReset={handleResetFilters}
      />

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <CalendarDays className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nuk ka ende termine
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Krijo terminin e parë për të planifikuar një shërbim ose kontroll
            automjeti.
          </p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <FileSearch className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nuk u gjet asnjë termin
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
                Lista e termineve
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Po shfaqen {filteredAppointments.length} nga{" "}
                {appointments.length} termine.
              </p>
            </div>

            {hasActiveFilters && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                Filtra aktivë
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Titulli</th>
                  <th className="px-6 py-4">Klienti</th>
                  <th className="px-6 py-4">Automjeti</th>
                  <th className="px-6 py-4">Biznesi</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Statusi</th>
                  <th className="px-6 py-4 text-right">Veprime</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredAppointments.map((appointment) => {
                  const statusDetails =
                    statusConfig[appointment.status] || statusConfig.PENDING;

                  return (
                    <tr
                      key={appointment.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="max-w-[280px] px-6 py-5">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {appointment.title}
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {appointment.description || "Pa përshkrim"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-900">
                          {appointment.customer?.name || "Pa klient"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {appointment.customer?.phone ||
                            appointment.customer?.email ||
                            "Pa kontakt"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-900">
                          {appointment.vehicle
                            ? [
                                appointment.vehicle.brand,
                                appointment.vehicle.model,
                              ]
                                .filter(Boolean)
                                .join(" ")
                            : "Pa automjet"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {appointment.vehicle?.plate || "Pa targë"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">
                        {appointment.business?.name || "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">
                        {formatDate(appointment.date)}
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
                          <AppointmentRowActions
                            appointment={appointment}
                            customers={customers}
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
