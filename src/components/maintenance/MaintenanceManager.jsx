"use client";

import { useState, useTransition } from "react";
import {
  CalendarDays,
  Edit3,
  Gauge,
  Loader2,
  Plus,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import { deleteMaintenanceItem } from "@/app/dashboard/maintenance/actions";
import MaintenanceForm from "@/components/maintenance/MaintenanceForm";
import { getMaintenanceTypeLabel } from "@/lib/maintenance";

function formatDate(value) {
  if (!value) return "Pa datë";

  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatMileage(value) {
  if (value === null || value === undefined) return "Pa km";

  return `${new Intl.NumberFormat("sq-AL").format(value)} km`;
}

function statusConfig(status) {
  if (status === "OVERDUE") {
    return {
      label: "Me vonesë",
      className: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (status === "SOON") {
    return {
      label: "Së shpejti",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Në rregull",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
}

export default function MaintenanceManager({
  vehicles,
  services,
  items,
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setIsFormOpen(true);
  }

  function removeItem(item) {
    const confirmed = window.confirm(
      `A je i sigurt që dëshiron të fshish "${item.title}"?`,
    );

    if (!confirmed) return;

    setMessage("");

    startTransition(async () => {
      const result = await deleteMaintenanceItem(item.id);
      setMessage(result?.message || "Veprimi nuk mund të përfundohej.");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">
            Regjistrimet e mirëmbajtjes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Menaxho intervalet, kilometrat dhe afatet e ardhshme.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          disabled={vehicles.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Shto mirëmbajtje
        </button>
      </div>

      {message ? (
        <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
          {message}
        </p>
      ) : null}

      {vehicles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <Wrench size={28} className="mx-auto text-slate-300" />
          <h3 className="mt-4 font-bold text-slate-950">
            Nuk ka automjete
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Regjistro fillimisht një automjet në dashboard.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <Wrench size={28} className="mx-auto text-slate-300" />
          <h3 className="mt-4 font-bold text-slate-950">
            Nuk ka mirëmbajtje të regjistruara
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Shto regjistrimin e parë për një automjet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => {
            const status = statusConfig(item.status);

            return (
              <article
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-slate-950">
                        {item.title}
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-blue-600">
                      {getMaintenanceTypeLabel(item.type)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.vehicle.plate} · {item.vehicle.brand}{" "}
                      {item.vehicle.model || ""}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      aria-label="Përditëso"
                    >
                      <Edit3 size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      disabled={isPending}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      aria-label="Fshi"
                    >
                      {isPending ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      <Gauge size={15} />
                      Kilometrat
                    </div>

                    <p className="mt-2 text-sm font-bold text-slate-950">
                      E fundit: {formatMileage(item.lastMileage)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Tjetra: {formatMileage(item.nextMileage)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      <CalendarDays size={15} />
                      Datat
                    </div>

                    <p className="mt-2 text-sm font-bold text-slate-950">
                      E fundit: {formatDate(item.lastDate)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Tjetra: {formatDate(item.nextDate)}
                    </p>
                  </div>
                </div>

                {item.notes ? (
                  <p className="mt-4 rounded-2xl border border-slate-100 px-4 py-3 text-sm leading-6 text-slate-500">
                    {item.notes}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  {editingItem
                    ? "Përditëso mirëmbajtjen"
                    : "Regjistro mirëmbajtje"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Vendos kilometrat ose datën e ardhshme.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <MaintenanceForm
                vehicles={vehicles}
                services={services}
                item={editingItem}
                onClose={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
