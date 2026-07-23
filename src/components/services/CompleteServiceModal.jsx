"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Gauge,
  Loader2,
  Plus,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import { completeServiceWithMaintenance } from "@/actions/service-maintenance-actions";
import { getMaintenanceTypeLabel, MAINTENANCE_TYPES } from "@/lib/maintenance";

function createEmptyItem() {
  return {
    id: crypto.randomUUID(),
    enabled: true,
    type: "ENGINE_OIL",
    title: getMaintenanceTypeLabel("ENGINE_OIL"),
    lastMileage: "",
    intervalKm: "10000",
    nextMileage: "",
    lastDate: new Date().toISOString().slice(0, 10),
    nextDate: "",
    notes: "",
  };
}

export default function CompleteServiceModal({ service }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [registerMaintenance, setRegisterMaintenance] = useState(true);
  const [items, setItems] = useState([createEmptyItem()]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const vehicleName = useMemo(() => {
    return (
      [service.vehicle?.brand, service.vehicle?.model]
        .filter(Boolean)
        .join(" ") || "Automjeti"
    );
  }, [service.vehicle?.brand, service.vehicle?.model]);

  function resetModal() {
    setRegisterMaintenance(true);
    setItems([createEmptyItem()]);
    setMessage("");
  }

  function closeModal() {
    if (isPending) return;

    setOpen(false);
    resetModal();
  }

  function updateItem(itemId, field, value) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        if (field === "type") {
          return {
            ...item,
            type: value,
            title: getMaintenanceTypeLabel(value),
          };
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  }

  function addItem() {
    setItems((currentItems) => [...currentItems, createEmptyItem()]);
  }

  function removeItem(itemId) {
    setItems((currentItems) =>
      currentItems.length === 1
        ? currentItems
        : currentItems.filter((item) => item.id !== itemId),
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await completeServiceWithMaintenance(
        service.id,
        registerMaintenance ? items.map(({ id, ...item }) => item) : [],
      );

      setMessage(result?.message || "Veprimi nuk mund të përfundohej.");

      if (result?.success) {
        router.refresh();
        setTimeout(() => {
          setOpen(false);
          resetModal();
        }, 700);
      }
    });
  }

  if (service.status === "COMPLETED" || service.status === "CANCELLED") {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
        title="Përfundo shërbimin"
      >
        <CheckCircle2 size={16} />
        Përfundo
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-7">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                  <CheckCircle2 size={17} />
                  Përfundimi i shërbimit
                </div>

                <h2 className="mt-2 text-xl font-black text-slate-950">
                  {service.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {vehicleName} · {service.vehicle?.plate || "Pa targë"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
                aria-label="Mbyll"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <input
                  type="checkbox"
                  checked={registerMaintenance}
                  onChange={(event) =>
                    setRegisterMaintenance(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-blue-300"
                />

                <div>
                  <p className="font-bold text-blue-950">
                    Regjistro si mirëmbajtje
                  </p>
                  <p className="mt-1 text-sm leading-6 text-blue-700">
                    AutoFlow do të krijojë afatet e ardhshme dhe do t&apos;i
                    shfaqë te moduli Mirëmbajtja.
                  </p>
                </div>
              </label>

              {registerMaintenance ? (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <section
                      key={item.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
                            {index + 1}
                          </span>

                          <div>
                            <h3 className="font-black text-slate-950">
                              Mirëmbajtja
                            </h3>
                            <p className="text-xs text-slate-500">
                              Kilometrat e ardhshëm llogariten automatikisht.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Hiq mirëmbajtjen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-bold text-slate-700">
                            Lloji
                          </span>

                          <select
                            value={item.type}
                            onChange={(event) =>
                              updateItem(item.id, "type", event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          >
                            {MAINTENANCE_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-2">
                          <span className="text-sm font-bold text-slate-700">
                            Titulli
                          </span>

                          <input
                            value={item.title}
                            onChange={(event) =>
                              updateItem(item.id, "title", event.target.value)
                            }
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          />
                        </label>
                      </div>

                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                          <Gauge size={15} />
                          Sipas kilometrave
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <label className="space-y-2">
                            <span className="text-xs font-bold text-slate-600">
                              Km aktuale
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={item.lastMileage}
                              onChange={(event) =>
                                updateItem(
                                  item.id,
                                  "lastMileage",
                                  event.target.value,
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            />
                          </label>

                          <label className="space-y-2">
                            <span className="text-xs font-bold text-slate-600">
                              Intervali
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={item.intervalKm}
                              onChange={(event) =>
                                updateItem(
                                  item.id,
                                  "intervalKm",
                                  event.target.value,
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            />
                          </label>

                          <label className="space-y-2">
                            <span className="text-xs font-bold text-slate-600">
                              Km e ardhshme
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={item.nextMileage}
                              onChange={(event) =>
                                updateItem(
                                  item.id,
                                  "nextMileage",
                                  event.target.value,
                                )
                              }
                              placeholder="Llogaritet vetë"
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                          <CalendarDays size={15} />
                          Sipas datës
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label className="space-y-2">
                            <span className="text-xs font-bold text-slate-600">
                              Data e punës
                            </span>
                            <input
                              type="date"
                              value={item.lastDate}
                              onChange={(event) =>
                                updateItem(
                                  item.id,
                                  "lastDate",
                                  event.target.value,
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            />
                          </label>

                          <label className="space-y-2">
                            <span className="text-xs font-bold text-slate-600">
                              Data e ardhshme
                            </span>
                            <input
                              type="date"
                              value={item.nextDate}
                              onChange={(event) =>
                                updateItem(
                                  item.id,
                                  "nextDate",
                                  event.target.value,
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            />
                          </label>
                        </div>
                      </div>

                      <label className="mt-4 block space-y-2">
                        <span className="text-sm font-bold text-slate-700">
                          Shënime
                        </span>
                        <textarea
                          rows="2"
                          value={item.notes}
                          onChange={(event) =>
                            updateItem(item.id, "notes", event.target.value)
                          }
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </label>
                    </section>
                  ))}

                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                  >
                    <Plus size={17} />
                    Shto mirëmbajtje tjetër
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center">
                  <Wrench className="mx-auto text-slate-300" />
                  <p className="mt-3 font-bold text-slate-700">
                    Shërbimi do të përfundohet pa mirëmbajtje
                  </p>
                </div>
              )}

              {message ? (
                <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
                  {message}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Anulo
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  Përfundo shërbimin
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
