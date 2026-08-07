import {
  BellRing,
  CalendarClock,
  Gauge,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import DeleteCustomerVehicleMaintenanceButton from "@/components/customer/DeleteCustomerVehicleMaintenanceButton";
import DeleteCustomerVehicleReminderButton from "@/components/customer/DeleteCustomerVehicleReminderButton";
import {
  CUSTOMER_VEHICLE_MAINTENANCE_LABELS,
  CUSTOMER_VEHICLE_REMINDER_LABELS,
} from "@/config/customer-vehicle-maintenance";
import { getCustomerVehicleDueState } from "@/lib/customer-vehicle-maintenance";
import { formatAppDate } from "@/lib/date-time";

function formatMileage(value) {
  if (value === null || value === undefined) return null;
  return `${new Intl.NumberFormat("sq-AL").format(value)} km`;
}

function getLatestMaintenanceByType(records) {
  const seen = new Set();

  return records.filter((record) => {
    if (seen.has(record.type)) return false;
    seen.add(record.type);
    return true;
  });
}

function DueBadge({ state }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${state.className}`}
    >
      {state.label}
    </span>
  );
}

function DueDetails({ nextDate, nextMileage, state }) {
  return (
    <div className="mt-2 space-y-1 text-xs text-slate-500">
      {nextDate ? <p>Data e ardhshme: {formatAppDate(nextDate)}</p> : null}
      {nextMileage !== null && nextMileage !== undefined ? (
        <p>Kilometrazhi i ardhshëm: {formatMileage(nextMileage)}</p>
      ) : null}
      <p className="font-semibold text-slate-600">{state.text}</p>
    </div>
  );
}

export default function CustomerVehicleMaintenanceOverview({
  vehicleId,
  currentMileage,
  maintenanceRecords = [],
  reminders = [],
  verifiedMaintenance = [],
}) {
  const currentMaintenance = getLatestMaintenanceByType(maintenanceRecords);

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-600">
                <Wrench size={17} />
                <p className="text-xs font-black uppercase tracking-[0.16em]">Mirëmbajtja</p>
              </div>
              <h2 className="mt-2 text-lg font-bold text-slate-950">Gjendja e mirëmbajtjes</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Afatet llogariten nga data dhe kilometrat që ke regjistruar.
              </p>
            </div>
            <div className="hidden rounded-2xl bg-slate-50 px-3 py-2 text-right sm:block">
              <p className="text-xs font-semibold text-slate-400">Aktive</p>
              <p className="text-lg font-black text-slate-950">{currentMaintenance.length}</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {currentMaintenance.length ? (
            currentMaintenance.map((item) => {
              const dueState = getCustomerVehicleDueState({
                currentMileage,
                nextMileage: item.nextMileage,
                nextDate: item.nextDate,
              });

              return (
                <div key={item.id} className="flex items-start gap-4 px-5 py-5 sm:px-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
                    <Wrench size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          {CUSTOMER_VEHICLE_MAINTENANCE_LABELS[item.type] || item.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Kryer më {formatAppDate(item.performedAt)}
                          {item.mileage !== null ? ` · ${formatMileage(item.mileage)}` : ""}
                        </p>
                      </div>
                      <DueBadge state={dueState} />
                    </div>
                    <DueDetails
                      nextDate={item.nextDate}
                      nextMileage={item.nextMileage}
                      state={dueState}
                    />
                    {item.notes ? (
                      <p className="mt-2 text-xs leading-5 text-slate-500">{item.notes}</p>
                    ) : null}
                  </div>
                  <DeleteCustomerVehicleMaintenanceButton
                    vehicleId={vehicleId}
                    maintenanceId={item.id}
                  />
                </div>
              );
            })
          ) : (
            <div className="px-5 py-10 text-center sm:px-6">
              <Wrench size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-700">Nuk ka mirëmbajtje të regjistruar.</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Shto mirëmbajtjen e parë nga formulari më sipër.</p>
            </div>
          )}
        </div>

        {verifiedMaintenance.length ? (
          <div className="border-t border-blue-100 bg-blue-50/50 px-5 py-5 sm:px-6">
            <div className="mb-3 flex items-center gap-2 text-blue-700">
              <ShieldCheck size={17} />
              <p className="text-xs font-black uppercase tracking-[0.14em]">Nga servisi</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {verifiedMaintenance.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl border border-blue-100 bg-white p-4">
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.lastDate ? formatAppDate(item.lastDate) : "Regjistruar nga servisi"}
                    {item.lastMileage !== null ? ` · ${formatMileage(item.lastMileage)}` : ""}
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 ring-1 ring-inset ring-blue-100">
                    E verifikuar nga servisi
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div id="kujtesat" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-2 text-blue-600">
            <BellRing size={17} />
            <p className="text-xs font-black uppercase tracking-[0.16em]">Kujtesat</p>
          </div>
          <h2 className="mt-2 text-lg font-bold text-slate-950">Afatet aktive</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Siguracioni, kontrolli teknik, taksat dhe afatet personale.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {reminders.length ? (
            reminders.map((reminder) => {
              const dueState = getCustomerVehicleDueState({
                currentMileage,
                nextMileage: reminder.dueMileage,
                nextDate: reminder.dueDate,
              });

              return (
                <div key={reminder.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CalendarClock size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">
                        {reminder.title || CUSTOMER_VEHICLE_REMINDER_LABELS[reminder.type]}
                      </p>
                      <DueBadge state={dueState} />
                    </div>
                    <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                      {reminder.dueDate ? <p>Afati: {formatAppDate(reminder.dueDate)}</p> : null}
                      {reminder.dueMileage !== null ? (
                        <p className="flex items-center gap-1"><Gauge size={12} />{formatMileage(reminder.dueMileage)}</p>
                      ) : null}
                      <p className="font-semibold text-slate-600">{dueState.text}</p>
                    </div>
                    {reminder.notes ? <p className="mt-2 text-xs leading-5 text-slate-500">{reminder.notes}</p> : null}
                  </div>
                  <DeleteCustomerVehicleReminderButton
                    vehicleId={vehicleId}
                    reminderId={reminder.id}
                  />
                </div>
              );
            })
          ) : (
            <div className="px-5 py-10 text-center">
              <BellRing size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-700">Nuk ka kujtesa aktive.</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Regjistro siguracionin, kontrollin teknik ose një afat tjetër.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
