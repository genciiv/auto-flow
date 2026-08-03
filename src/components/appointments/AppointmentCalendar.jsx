"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GripVertical,
  UserRound,
} from "lucide-react";

import AppointmentRowActions from "@/components/appointments/AppointmentRowActions";
import { rescheduleAppointment } from "@/actions/appointment-actions";

const STATUS = {
  PENDING: { label: "Në pritje", className: "border-amber-200 bg-amber-50 text-amber-800" },
  CONFIRMED: { label: "Konfirmuar", className: "border-cyan-200 bg-cyan-50 text-cyan-800" },
  IN_PROGRESS: { label: "Në proces", className: "border-blue-200 bg-blue-50 text-blue-800" },
  COMPLETED: { label: "Përfunduar", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  CANCELLED: { label: "Anuluar", className: "border-red-200 bg-red-50 text-red-800" },
  NO_SHOW: { label: "Nuk u paraqit", className: "border-slate-300 bg-slate-100 text-slate-700" },
};

const WEEKDAYS = ["Hën", "Mar", "Mër", "Enj", "Pre", "Sht", "Die"];

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateKey(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalInput(date) {
  const value = new Date(date);
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

function formatTime(value) {
  return new Intl.DateTimeFormat("sq-AL", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat("sq-AL", options).format(new Date(value));
}

function startOfWeek(value) {
  const date = startOfDay(value);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date;
}

function monthGrid(anchor) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function weekGrid(anchor) {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function combineDateAndTime(targetDate, sourceDate) {
  const target = new Date(targetDate);
  const source = new Date(sourceDate);
  target.setHours(source.getHours(), source.getMinutes(), 0, 0);
  return target;
}

function AppointmentCard({ appointment, customers, vehicles, staff, canUpdate, canDelete, canStartService, compact = false, draggable = false, onDragStart }) {
  const status = STATUS[appointment.status] || STATUS.PENDING;

  return (
    <article
      draggable={draggable}
      onDragStart={(event) => onDragStart?.(event, appointment)}
      className={`group rounded-xl border ${status.className} ${compact ? "p-2" : "p-3"} shadow-sm transition hover:shadow-md`}
    >
      <div className="flex items-start gap-2">
        {draggable ? <GripVertical size={14} className="mt-0.5 shrink-0 cursor-grab opacity-50" /> : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <span>{formatTime(appointment.date)}</span>
            <span>·</span>
            <span>{appointment.durationMinutes || 60} min</span>
          </div>
          <p className="mt-1 truncate text-xs font-bold">{appointment.title}</p>
          {!compact ? (
            <div className="mt-2 space-y-1 text-[11px] opacity-80">
              <p className="truncate">{appointment.customer?.name || "Pa klient"}</p>
              <p className="truncate">{appointment.assignedUser?.name || "Pa punonjës"}</p>
            </div>
          ) : null}
        </div>
        {!compact ? (
          <AppointmentRowActions
            appointment={appointment}
            customers={customers}
            vehicles={vehicles}
            staff={staff}
            canUpdate={canUpdate}
            canDelete={canDelete}
            canStartService={canStartService}
          />
        ) : null}
      </div>
    </article>
  );
}

export default function AppointmentCalendar({
  appointments = [],
  customers = [],
  vehicles = [],
  staff = [],
  canUpdateAppointment = false,
  canDeleteAppointment = false,
  canStartService = false,
}) {
  const [view, setView] = useState("MONTH");
  const [anchor, setAnchor] = useState(() => new Date());
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [staffFilter, setStaffFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => appointments.filter((appointment) => {
    const statusOk = statusFilter === "ALL" || appointment.status === statusFilter;
    const staffOk = staffFilter === "ALL" || appointment.assignedUserId === staffFilter;
    return statusOk && staffOk;
  }), [appointments, statusFilter, staffFilter]);

  const grouped = useMemo(() => {
    const result = {};
    for (const appointment of filtered) {
      const key = dateKey(appointment.date);
      (result[key] ||= []).push(appointment);
    }
    for (const items of Object.values(result)) items.sort((a, b) => new Date(a.date) - new Date(b.date));
    return result;
  }, [filtered]);

  const days = view === "MONTH" ? monthGrid(anchor) : view === "WEEK" ? weekGrid(anchor) : [startOfDay(anchor)];

  function move(direction) {
    const next = new Date(anchor);
    if (view === "MONTH") next.setMonth(next.getMonth() + direction);
    else if (view === "WEEK") next.setDate(next.getDate() + 7 * direction);
    else next.setDate(next.getDate() + direction);
    setAnchor(next);
  }

  function handleDragStart(event, appointment) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/appointment-id", appointment.id);
  }

  function handleDrop(event, targetDate) {
    event.preventDefault();
    if (!canUpdateAppointment) return;
    const appointmentId = event.dataTransfer.getData("text/appointment-id");
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) return;

    const newDate = combineDateAndTime(targetDate, appointment.date);
    const formData = new FormData();
    formData.set("appointmentId", appointment.id);
    formData.set("date", toLocalInput(newDate));

    setMessage("");
    startTransition(async () => {
      const result = await rescheduleAppointment(formData);
      setMessage(result?.message || (result?.success ? "Termini u riplanifikua." : "Riplanifikimi dështoi."));
    });
  }

  const title = view === "MONTH"
    ? formatDate(anchor, { month: "long", year: "numeric" })
    : view === "WEEK"
      ? `${formatDate(days[0], { day: "numeric", month: "short" })} – ${formatDate(days[6], { day: "numeric", month: "short", year: "numeric" })}`
      : formatDate(anchor, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2"><CalendarDays size={19} className="text-blue-600" /><h2 className="text-base font-bold capitalize text-slate-950">{title}</h2></div>
            <p className="mt-1 text-xs text-slate-500">Pamje ditore, javore dhe mujore. Tërhiq një termin në një datë tjetër për ta riplanifikuar.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select value={staffFilter} onChange={(event) => setStaffFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold">
              <option value="ALL">Të gjithë punonjësit</option>
              {staff.map((member) => <option key={member.user.id} value={member.user.id}>{member.user.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold">
              <option value="ALL">Të gjitha statuset</option>
              {Object.entries(STATUS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
            </select>
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              {[['DAY','Ditë'],['WEEK','Javë'],['MONTH','Muaj']].map(([key,label]) => <button key={key} type="button" onClick={() => setView(key)} className={`rounded-lg px-3 py-2 text-xs font-bold ${view === key ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>{label}</button>)}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={() => setAnchor(new Date())} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold">Sot</button>
          <button type="button" onClick={() => move(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200"><ChevronLeft size={18} /></button>
          <button type="button" onClick={() => move(1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200"><ChevronRight size={18} /></button>
          {isPending ? <span className="text-xs font-semibold text-blue-600">Duke riplanifikuar…</span> : null}
          {message ? <span className="text-xs font-semibold text-slate-600">{message}</span> : null}
        </div>
      </div>

      {view === "MONTH" ? (
        <>
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">{WEEKDAYS.map((day) => <div key={day} className="px-2 py-3 text-center text-[11px] font-bold uppercase text-slate-500">{day}</div>)}</div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const items = grouped[dateKey(day)] || [];
              const outside = day.getMonth() !== anchor.getMonth();
              return <div key={dateKey(day)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, day)} className={`min-h-32 border-b border-r border-slate-100 p-2 ${outside ? "bg-slate-50/60" : "bg-white"}`}>
                <div className="mb-2 flex items-center justify-between"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${dateKey(day) === dateKey(new Date()) ? "bg-blue-600 text-white" : outside ? "text-slate-300" : "text-slate-700"}`}>{day.getDate()}</span><span className="text-[10px] font-bold text-slate-400">{items.length || ""}</span></div>
                <div className="space-y-1.5">{items.slice(0, 3).map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} customers={customers} vehicles={vehicles} staff={staff} compact draggable={canUpdateAppointment} onDragStart={handleDragStart} />)}{items.length > 3 ? <p className="text-[10px] font-semibold text-slate-400">+{items.length - 3} të tjera</p> : null}</div>
              </div>;
            })}
          </div>
        </>
      ) : (
        <div className={`grid ${view === "WEEK" ? "grid-cols-1 lg:grid-cols-7" : "grid-cols-1"}`}>
          {days.map((day) => {
            const items = grouped[dateKey(day)] || [];
            return <div key={dateKey(day)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, day)} className="min-h-[520px] border-r border-slate-100 p-3">
              <div className="mb-3 border-b border-slate-100 pb-3"><p className="text-xs font-bold uppercase text-slate-500">{formatDate(day, { weekday: "short" })}</p><p className="mt-1 text-lg font-black text-slate-950">{formatDate(day, { day: "numeric", month: "short" })}</p></div>
              <div className="space-y-3">{items.length ? items.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} customers={customers} vehicles={vehicles} staff={staff} canUpdate={canUpdateAppointment} canDelete={canDeleteAppointment} canStartService={canStartService} draggable={canUpdateAppointment} onDragStart={handleDragStart} />) : <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">Nuk ka termine</div>}</div>
            </div>;
          })}
        </div>
      )}

      <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-xs text-slate-600"><Clock3 size={15} /> Kapaciteti ditor: {filtered.reduce((sum, item) => sum + (item.durationMinutes || 60), 0)} minuta të planifikuara</div>
        <div className="flex items-center gap-2 text-xs text-slate-600"><UserRound size={15} /> {staff.length} punonjës të disponueshëm për caktim</div>
        <div className="text-xs text-slate-500">Terminet e përfunduara, anuluara dhe mosparaqitjet nuk riplanifikohen me drag-and-drop.</div>
      </div>
    </section>
  );
}
