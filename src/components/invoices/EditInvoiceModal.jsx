"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ReceiptText,
  X,
} from "lucide-react";

import { updateInvoice } from "@/actions/invoice-actions";

function createInitialForm(invoice) {
  return {
    number: invoice?.number || "",
    customerId: invoice?.customerId || "",
    vehicleId: invoice?.vehicleId || "",
    serviceId: invoice?.serviceId || "",
    total: String(Number(invoice?.total || 0)),
    status: invoice?.status || "DRAFT",
  };
}

function getServiceTotal(service) {
  if (!service) return "";

  const value = service.totalCost ?? service.total ?? service.finalTotal ?? 0;

  return String(Number(value || 0));
}

export default function EditInvoiceModal({
  invoice,
  customers = [],
  vehicles = [],
  services = [],
  onClose,
}) {
  const router = useRouter();

  const [form, setForm] = useState(() => createInitialForm(invoice));

  const [message, setMessage] = useState(null);
  const [isPending, startTransition] = useTransition();

  const filteredVehicles = useMemo(() => {
    if (!form.customerId) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => vehicle.customerId === form.customerId);
  }, [vehicles, form.customerId]);

  const availableServices = useMemo(() => {
    return services.filter((service) => {
      const isCurrentService = service.id === invoice.serviceId;

      const hasNoInvoice = !service.invoice;

      return isCurrentService || hasNoInvoice;
    });
  }, [services, invoice.serviceId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setMessage(null);

    if (name === "customerId") {
      setForm((current) => {
        const selectedVehicleStillValid = vehicles.some(
          (vehicle) =>
            vehicle.id === current.vehicleId && vehicle.customerId === value,
        );

        return {
          ...current,
          customerId: value,
          vehicleId: selectedVehicleStillValid ? current.vehicleId : "",
          serviceId: "",
        };
      });

      return;
    }

    if (name === "serviceId") {
      const selectedService = services.find((service) => service.id === value);

      if (!selectedService) {
        setForm((current) => ({
          ...current,
          serviceId: "",
        }));

        return;
      }

      setForm((current) => ({
        ...current,
        serviceId: selectedService.id,
        customerId:
          selectedService.customerId ||
          selectedService.vehicle?.customerId ||
          current.customerId,
        vehicleId:
          selectedService.vehicleId ||
          selectedService.vehicle?.id ||
          current.vehicleId,
        total: getServiceTotal(selectedService),
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleClose() {
    if (isPending) return;

    setMessage(null);
    onClose();
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!invoice?.id) {
      setMessage({
        type: "error",
        text: "Fatura që do të modifikohet nuk u gjet.",
      });

      return;
    }

    if (!form.number.trim()) {
      setMessage({
        type: "error",
        text: "Numri i faturës është i detyrueshëm.",
      });

      return;
    }

    if (!form.serviceId && String(form.total).trim() === "") {
      setMessage({
        type: "error",
        text: "Vendos totalin e faturës.",
      });

      return;
    }

    const total = Number(form.total);

    if (Number.isNaN(total)) {
      setMessage({
        type: "error",
        text: "Totali i faturës nuk është i vlefshëm.",
      });

      return;
    }

    if (total < 0) {
      setMessage({
        type: "error",
        text: "Totali nuk mund të jetë negativ.",
      });

      return;
    }

    const formData = new FormData();

    formData.set("number", form.number.trim());
    formData.set("customerId", form.customerId);
    formData.set("vehicleId", form.vehicleId);
    formData.set("serviceId", form.serviceId);
    formData.set("total", form.total);
    formData.set("status", form.status);

    setMessage(null);

    startTransition(async () => {
      const result = await updateInvoice(invoice.id, formData);

      if (!result?.success) {
        setMessage({
          type: "error",
          text: result?.message || "Fatura nuk u përditësua.",
        });

        return;
      }

      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Mbyll modalin"
        onClick={handleClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ReceiptText className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Modifiko faturën
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Përditëso të dhënat e faturës {invoice.number}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="overflow-y-auto px-6 py-5">
            {message && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}

                <span>{message.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Numri i faturës
                </label>

                <input
                  type="text"
                  name="number"
                  value={form.number}
                  onChange={handleChange}
                  disabled={isPending}
                  placeholder="INV-2026-0001"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Klienti
                </label>

                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={handleChange}
                  disabled={isPending || Boolean(form.serviceId)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">Pa klient</option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                      {customer.phone ? ` — ${customer.phone}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Automjeti
                </label>

                <select
                  name="vehicleId"
                  value={form.vehicleId}
                  onChange={handleChange}
                  disabled={isPending || Boolean(form.serviceId)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">Pa automjet</option>

                  {filteredVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate}
                      {vehicle.brand ? ` — ${vehicle.brand}` : ""}
                      {vehicle.model ? ` ${vehicle.model}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Shërbimi
                </label>

                <select
                  name="serviceId"
                  value={form.serviceId}
                  onChange={handleChange}
                  disabled={isPending}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">Faturë manuale, pa shërbim</option>

                  {availableServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title || "Shërbim"}
                      {service.vehicle?.plate
                        ? ` — ${service.vehicle.plate}`
                        : ""}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Kur zgjidhet një shërbim, klienti, automjeti dhe totali
                  plotësohen automatikisht.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Totali
                </label>

                <div className="relative">
                  <input
                    type="number"
                    name="total"
                    min="0"
                    step="0.01"
                    value={form.total}
                    onChange={handleChange}
                    disabled={isPending || Boolean(form.serviceId)}
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-14 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">
                    Lekë
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Statusi
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={isPending}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="UNPAID">E papaguar</option>
                  <option value="PAID">E paguar</option>
                  <option value="OVERDUE">E vonuar</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anulo
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Duke ruajtur...
                </>
              ) : (
                "Ruaj ndryshimet"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
