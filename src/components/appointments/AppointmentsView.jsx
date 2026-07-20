"use client";

import { useState } from "react";
import { CalendarDays, List } from "lucide-react";

import AppointmentCalendar from "@/components/appointments/AppointmentCalendar";
import AppointmentsTable from "@/components/appointments/AppointmentsTable";

export default function AppointmentsView({
  appointments = [],
  customers = [],
  vehicles = [],
}) {
  const [activeView, setActiveView] = useState("calendar");

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">
            Pamja e termineve
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Shiko terminet në kalendar ose menaxhoji në listën e detajuar.
          </p>
        </div>

        <div className="inline-flex w-full rounded-xl bg-slate-100 p-1 sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveView("calendar")}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-none ${
              activeView === "calendar"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <CalendarDays size={17} />
            Kalendari
          </button>

          <button
            type="button"
            onClick={() => setActiveView("list")}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-none ${
              activeView === "list"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <List size={17} />
            Lista
          </button>
        </div>
      </div>

      {activeView === "calendar" ? (
        <AppointmentCalendar
          appointments={appointments}
          customers={customers}
          vehicles={vehicles}
        />
      ) : (
        <AppointmentsTable
          appointments={appointments}
          customers={customers}
          vehicles={vehicles}
        />
      )}
    </div>
  );
}
