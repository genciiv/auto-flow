"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Plus, X } from "lucide-react";
import { createInvoice } from "@/actions/invoice-actions";

const INITIAL_FORM = {
  customerId: "",
  vehicleId: "",
  serviceId: "",
  number: "",
  total: "",
  status: "DRAFT",
};

export default function CreateInvoiceModal({
  customers = [],
  vehicles = [],
  services = [],
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const availableServices = useMemo(() => {
    return services.filter((service) => !service.invoice);
  }, [services]);

  const filteredVehicles = useMemo(() => {
    if (!form.customerId) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => vehicle.customerId === form.customerId);
  }, [vehicles, form.customerId]);

  function resetModal() {
    setForm(INITIAL_FORM);
    setError("");
    setIsSubmitting(false);
  }

  function handleOpen() {
    resetModal();
    setOpen(true);
  }

  function handleClose() {
    if (isSubmitting) return;

    resetModal();
    setOpen(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setError("");

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleCustomerChange(event) {
    const customerId = event.target.value;

    setError("");

    setForm((currentForm) => {
      const selectedVehicleStillValid = vehicles.some(
        (vehicle) =>
          vehicle.id === currentForm.vehicleId &&
          (!customerId || vehicle.customerId === customerId),
      );

      return {
        ...currentForm,
        customerId,
        vehicleId: selectedVehicleStillValid ? currentForm.vehicleId : "",
        serviceId: "",
      };
    });
  }

  function handleServiceChange(event) {
    const serviceId = event.target.value;

    setError("");

    if (!serviceId) {
      setForm((currentForm) => ({
        ...currentForm,
        serviceId: "",
      }));

      return;
    }

    const selectedService = services.find(
      (service) => service.id === serviceId,
    );

    if (!selectedService) {
      setForm((currentForm) => ({
        ...currentForm,
        serviceId: "",
      }));

      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      serviceId: selectedService.id,
      customerId: selectedService.customerId || currentForm.customerId || "",
      vehicleId: selectedService.vehicleId || currentForm.vehicleId || "",
      total:
        selectedService.totalCost !== null &&
        selectedService.totalCost !== undefined
          ? String(Number(selectedService.totalCost))
          : currentForm.total,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      if (!form.serviceId && form.total === "") {
        setError("Vendos totalin e faturës ose zgjidh një shërbim.");
        return;
      }

      const total = Number(form.total);

      if (!form.serviceId && (Number.isNaN(total) || total < 0)) {
        setError("Totali i faturës nuk është i vlefshëm.");
        return;
      }

      const formData = new FormData();

      formData.set("customerId", form.customerId);
      formData.set("vehicleId", form.vehicleId);
      formData.set("serviceId", form.serviceId);
      formData.set("number", form.number.trim());
      formData.set("total", form.total);
      formData.set("status", form.status);

      const result = await createInvoice(formData);

      if (!result?.success) {
        setError(result?.message || "Fatura nuk mund të krijohej.");
        return;
      }

      resetModal();
      setOpen(false);

      router.refresh();
    } catch (error) {
      console.error("Create invoice error:", error);

      setError("Ndodhi një gabim gjatë krijimit të faturës.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
      >
        <Plus size={18} />
        Krijo faturë
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClose();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Krijo faturë të re
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Krijo faturë manualisht ose direkt nga një shërbim.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Mbyll modalin"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />

                <p>{error}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label
                  htmlFor="invoice-service"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Krijo nga shërbimi
                </label>

                <select
                  id="invoice-service"
                  name="serviceId"
                  value={form.serviceId}
                  onChange={handleServiceChange}
                  disabled={isSubmitting}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">Faturë manuale — pa shërbim</option>

                  {availableServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                      {service.vehicle?.plate
                        ? ` — ${service.vehicle.plate}`
                        : ""}
                      {service.totalCost !== null &&
                      service.totalCost !== undefined
                        ? ` — €${Number(service.totalCost).toFixed(2)}`
                        : ""}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-slate-500">
                  Kur zgjedh një shërbim, klienti, automjeti dhe totali
                  plotësohen automatikisht.
                </p>
              </div>

              <div>
                <label
                  htmlFor="invoice-customer"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Klienti
                </label>

                <select
                  id="invoice-customer"
                  name="customerId"
                  value={form.customerId}
                  onChange={handleCustomerChange}
                  disabled={isSubmitting || Boolean(form.serviceId)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">Pa klient</option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="invoice-vehicle"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Automjeti
                </label>

                <select
                  id="invoice-vehicle"
                  name="vehicleId"
                  value={form.vehicleId}
                  onChange={handleChange}
                  disabled={isSubmitting || Boolean(form.serviceId)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">Pa automjet</option>

                  {filteredVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} — {vehicle.brand} {vehicle.model || ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="invoice-number"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Numri i faturës
                </label>

                <input
                  id="invoice-number"
                  name="number"
                  value={form.number}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Gjenerohet automatikisht"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Lëre bosh për ta gjeneruar automatikisht.
                </p>
              </div>

              <div>
                <label
                  htmlFor="invoice-total"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Totali *
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-500">
                    €
                  </span>

                  <input
                    id="invoice-total"
                    name="total"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.total}
                    onChange={handleChange}
                    disabled={isSubmitting || Boolean(form.serviceId)}
                    required={!form.serviceId}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-8 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                {form.serviceId && (
                  <p className="mt-2 text-xs text-slate-500">
                    Totali merret automatikisht nga shërbimi.
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="invoice-status"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Statusi
                </label>

                <select
                  id="invoice-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="UNPAID">Pa paguar</option>
                  <option value="PAID">Paguar</option>
                  <option value="OVERDUE">Vonuar</option>
                </select>
              </div>

              <div className="md:col-span-2 flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anulo
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Duke ruajtur...
                    </>
                  ) : (
                    "Ruaj faturën"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
