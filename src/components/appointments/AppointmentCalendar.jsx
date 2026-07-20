"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  UserRound,
  Car,
} from "lucide-react";

import AppointmentRowActions from "@/components/appointments/AppointmentRowActions";

const statusConfig = {
  PENDING: {
    label: "Në pritje",
    dotClassName: "bg-amber-500",
    cardClassName:
      "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
  },

  IN_PROGRESS: {
    label: "Në proces",
    dotClassName: "bg-blue-500",
    cardClassName:
      "border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-300",
    badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
  },

  COMPLETED: {
    label: "Përfunduar",
    dotClassName: "bg-emerald-500",
    cardClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  CANCELLED: {
    label: "Anuluar",
    dotClassName: "bg-red-500",
    cardClassName: "border-red-200 bg-red-50 text-red-800 hover:border-red-300",
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
  },
};

const weekdays = [
  "Hënë",
  "Martë",
  "Mërkurë",
  "Enjte",
  "Premte",
  "Shtunë",
  "Diel",
];

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function getDateKey(value) {
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

function formatTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatSelectedDate(value) {
  return new Intl.DateTimeFormat("sq-AL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

function createCalendarDays(currentMonth) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const totalDaysInMonth = lastDayOfMonth.getDate();

  const previousMonthLastDay = new Date(year, month, 0).getDate();

  const days = [];

  for (let index = firstDayIndex - 1; index >= 0; index -= 1) {
    days.push({
      date: new Date(year, month - 1, previousMonthLastDay - index),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= totalDaysInMonth; day += 1) {
    days.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    });
  }

  let nextMonthDay = 1;

  while (days.length < 42) {
    days.push({
      date: new Date(year, month + 1, nextMonthDay),
      isCurrentMonth: false,
    });

    nextMonthDay += 1;
  }

  return days;
}

function AppointmentItem({
  appointment,
  customers,
  vehicles,
  compact = false,
}) {
  const status = statusConfig[appointment.status] || statusConfig.PENDING;

  if (compact) {
    return (
      <div
        className={`rounded-lg border px-2 py-1.5 text-xs transition ${status.cardClassName}`}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dotClassName}`}
          />

          <span className="shrink-0 font-semibold">
            {formatTime(appointment.date)}
          </span>

          <span className="truncate font-medium">{appointment.title}</span>
        </div>
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${status.badgeClassName}`}
            >
              {status.label}
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Clock3 size={14} />
              {formatTime(appointment.date)}
            </span>
          </div>

          <h3 className="mt-3 truncate text-sm font-bold text-slate-950">
            {appointment.title}
          </h3>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {appointment.description || "Pa përshkrim"}
          </p>
        </div>

        <AppointmentRowActions
          appointment={appointment}
          customers={customers}
          vehicles={vehicles}
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
          <UserRound size={15} className="shrink-0 text-slate-400" />

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-700">
              {appointment.customer?.name || "Pa klient"}
            </p>

            <p className="truncate text-[11px] text-slate-400">
              {appointment.customer?.phone || "Pa kontakt"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
          <Car size={15} className="shrink-0 text-slate-400" />

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-700">
              {appointment.vehicle
                ? [appointment.vehicle.brand, appointment.vehicle.model]
                    .filter(Boolean)
                    .join(" ")
                : "Pa automjet"}
            </p>

            <p className="truncate text-[11px] text-slate-400">
              {appointment.vehicle?.plate || "Pa targë"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AppointmentCalendar({
  appointments = [],
  customers = [],
  vehicles = [],
}) {
  const today = useMemo(() => new Date(), []);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState(today);

  const calendarDays = useMemo(
    () => createCalendarDays(currentMonth),
    [currentMonth],
  );

  const appointmentsByDate = useMemo(() => {
    const groupedAppointments = {};

    appointments.forEach((appointment) => {
      const dateKey = getDateKey(appointment.date);

      if (!dateKey) {
        return;
      }

      if (!groupedAppointments[dateKey]) {
        groupedAppointments[dateKey] = [];
      }

      groupedAppointments[dateKey].push(appointment);
    });

    Object.values(groupedAppointments).forEach((items) => {
      items.sort(
        (first, second) =>
          new Date(first.date).getTime() - new Date(second.date).getTime(),
      );
    });

    return groupedAppointments;
  }, [appointments]);

  const selectedDateKey = getDateKey(selectedDate);

  const selectedAppointments = appointmentsByDate[selectedDateKey] || [];

  const monthLabel = new Intl.DateTimeFormat("sq-AL", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  function goToPreviousMonth() {
    setCurrentMonth(
      (currentValue) =>
        new Date(currentValue.getFullYear(), currentValue.getMonth() - 1, 1),
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      (currentValue) =>
        new Date(currentValue.getFullYear(), currentValue.getMonth() + 1, 1),
    );
  }

  function goToToday() {
    const currentDate = new Date();

    setCurrentMonth(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    );

    setSelectedDate(currentDate);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-600" />

              <h2 className="text-base font-bold capitalize text-slate-950">
                {monthLabel}
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Kliko një datë për të parë terminet e planifikuara.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToToday}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Sot
            </button>

            <button
              type="button"
              onClick={goToPreviousMonth}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              aria-label="Muaji i kaluar"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              aria-label="Muaji tjetër"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {weekdays.map((weekday) => (
            <div
              key={weekday}
              className="px-2 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500"
            >
              <span className="hidden sm:inline">{weekday}</span>
              <span className="sm:hidden">{weekday.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map(({ date, isCurrentMonth }) => {
            const dateKey = getDateKey(date);
            const dayAppointments = appointmentsByDate[dateKey] || [];

            const isToday = dateKey === getDateKey(today);
            const isSelected = dateKey === getDateKey(selectedDate);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`min-h-24 border-b border-r border-slate-100 p-2 text-left transition sm:min-h-32 ${
                  isSelected
                    ? "bg-blue-50/70 ring-1 ring-inset ring-blue-200"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : isCurrentMonth
                          ? "text-slate-800"
                          : "text-slate-300"
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  {dayAppointments.length > 0 ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      {dayAppointments.length}
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 hidden space-y-1.5 sm:block">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <AppointmentItem
                      key={appointment.id}
                      appointment={appointment}
                      customers={customers}
                      vehicles={vehicles}
                      compact
                    />
                  ))}

                  {dayAppointments.length > 3 ? (
                    <p className="px-1 text-[10px] font-semibold text-slate-400">
                      +{dayAppointments.length - 3} të tjera
                    </p>
                  ) : null}
                </div>

                {dayAppointments.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1 sm:hidden">
                    {dayAppointments.slice(0, 4).map((appointment) => {
                      const status =
                        statusConfig[appointment.status] ||
                        statusConfig.PENDING;

                      return (
                        <span
                          key={appointment.id}
                          className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Dita e zgjedhur
          </p>

          <h2 className="mt-2 text-base font-bold capitalize text-slate-950">
            {formatSelectedDate(selectedDate)}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {selectedAppointments.length === 1
              ? "1 termin i planifikuar"
              : `${selectedAppointments.length} termine të planifikuara`}
          </p>
        </div>

        <div className="max-h-[680px] space-y-3 overflow-y-auto p-4">
          {selectedAppointments.length > 0 ? (
            selectedAppointments.map((appointment) => (
              <AppointmentItem
                key={appointment.id}
                appointment={appointment}
                customers={customers}
                vehicles={vehicles}
              />
            ))
          ) : (
            <div className="px-4 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <CalendarDays size={22} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                Nuk ka termine
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Nuk ka asnjë termin të planifikuar për këtë datë.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
