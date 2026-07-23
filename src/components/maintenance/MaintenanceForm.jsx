"use client";
import { useMemo, useState, useTransition } from "react";
import { Loader2, Save, X } from "lucide-react";

import {
  createMaintenanceItem,
  updateMaintenanceItem,
} from "@/app/dashboard/maintenance/actions";
import { getMaintenanceTypeLabel, MAINTENANCE_TYPES } from "@/lib/maintenance";

export default function MaintenanceForm({
  vehicles,
  services,
  item = null,
  onClose,
}) {
  const [message, setMessage] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    item?.vehicleId || vehicles[0]?.id || "",
  );
  const [selectedType, setSelectedType] = useState(item?.type || "ENGINE_OIL");
  const [title, setTitle] = useState(
    item?.title || getMaintenanceTypeLabel(item?.type || "ENGINE_OIL"),
  );
  const [isPending, startTransition] = useTransition();

  const filteredServices = useMemo(
    () => services.filter((service) => service.vehicleId === selectedVehicleId),
    [services, selectedVehicleId],
  );

  function submit(formData) {
    setMessage("");

    startTransition(async () => {
      const result = item
        ? await updateMaintenanceItem(item.id, formData)
        : await createMaintenanceItem(formData);

      setMessage(result?.message || "Veprimi nuk mund të përfundohej.");

      if (result?.success) {
        onClose?.();
      }
    });
  }

  return (
    <form action={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-700">Automjeti</span>
          <select
            name="vehicleId"
            value={selectedVehicleId}
            onChange={(event) => setSelectedVehicleId(event.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} · {vehicle.brand} {vehicle.model || ""}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-700">Lloji</span>
          <select
            name="type"
            value={selectedType}
            onChange={(event) => {
              const value = event.target.value;

              setSelectedType(value);

              if (!item) {
                setTitle(getMaintenanceTypeLabel(value));
              }
            }}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {MAINTENANCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-700">Titulli</span>
        <input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          minLength={2}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-700">
          Shërbimi i lidhur
        </span>
        <select
          name="serviceRecordId"
          defaultValue={item?.serviceRecordId || ""}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="">Pa shërbim të lidhur</option>
          {filteredServices.map((service) => (
            <option key={service.id} value={service.id}>
              {service.title}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-700">Km e fundit</span>
          <input
            name="lastMileage"
            type="number"
            min="0"
            defaultValue={item?.lastMileage ?? ""}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-700">Intervali km</span>
          <input
            name="intervalKm"
            type="number"
            min="0"
            defaultValue={item?.intervalKm ?? ""}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-700">
            Km e ardhshme
          </span>
          <input
            name="nextMileage"
            type="number"
            min="0"
            defaultValue={item?.nextMileage ?? ""}
            placeholder="Llogaritet vetë"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-700">
            Data e fundit
          </span>
          <input
            name="lastDate"
            type="date"
            defaultValue={
              item?.lastDate
                ? new Date(item.lastDate).toISOString().slice(0, 10)
                : ""
            }
            className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-700">
            Data e ardhshme
          </span>
          <input
            name="nextDate"
            type="date"
            defaultValue={
              item?.nextDate
                ? new Date(item.nextDate).toISOString().slice(0, 10)
                : ""
            }
            className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-700">Shënime</span>
        <textarea
          name="notes"
          rows="3"
          defaultValue={item?.notes || ""}
          className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      {message ? (
        <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <X size={17} />
          Mbyll
        </button>

        <button
          type="submit"
          disabled={isPending || vehicles.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}
          {item ? "Ruaj ndryshimet" : "Regjistro mirëmbajtjen"}
        </button>
      </div>
    </form>
  );
}
