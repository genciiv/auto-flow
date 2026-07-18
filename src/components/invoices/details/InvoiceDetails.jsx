import {
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Hash,
  History,
  Package,
  ReceiptText,
  UserRound,
  Wrench,
} from "lucide-react";

import InvoiceDetailsActions from "./InvoiceDetailsActions";
import { formatCurrency } from "@/lib/formatters";

const statusConfig = {
  DRAFT: {
    label: "Draft",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  UNPAID: {
    label: "E papaguar",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  PAID: {
    label: "E paguar",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  OVERDUE: {
    label: "E vonuar",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

function formatDate(value, includeTime = false) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}

function getServiceStatusLabel(status) {
  if (status === "COMPLETED") {
    return "I përfunduar";
  }

  if (status === "IN_PROGRESS") {
    return "Në proces";
  }

  if (status === "CANCELLED") {
    return "I anuluar";
  }

  return "Në pritje";
}

function getPartLineTotal(usage) {
  const storedTotal = Number(usage?.total || 0);

  if (storedTotal > 0) {
    return storedTotal;
  }

  return Number(usage?.quantity || 0) * Number(usage?.unitPrice || 0);
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="max-w-[65%] text-right text-sm font-medium text-slate-900">
        {value || "—"}
      </span>
    </div>
  );
}

function InfoCard({ icon: Icon, title, description, children }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-950">{title}</h2>

          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </div>
  );
}

export default function InvoiceDetails({
  invoice,
  customers = [],
  vehicles = [],
  services = [],
}) {
  const statusDetails = statusConfig[invoice.status] || statusConfig.DRAFT;

  const businessAddress = [invoice.business?.address, invoice.business?.city]
    .filter(Boolean)
    .join(", ");

  const vehicleName = [invoice.vehicle?.brand, invoice.vehicle?.model]
    .filter(Boolean)
    .join(" ");

  const serviceVehicleName = [
    invoice.service?.vehicle?.brand,
    invoice.service?.vehicle?.model,
  ]
    .filter(Boolean)
    .join(" ");

  const partsUsed = invoice.service?.partsUsed || [];

  const partsTotal = partsUsed.reduce((sum, usage) => {
    return sum + getPartLineTotal(usage);
  }, 0);

  const serviceTotal = Number(invoice.service?.total || 0);

  const laborTotal = invoice.service
    ? Math.max(serviceTotal - partsTotal, 0)
    : 0;

  const invoiceTotal = Number(invoice.total || 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-blue-600">
              Invoice details
            </p>

            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusDetails.className}`}
            >
              {statusDetails.label}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Fatura {invoice.number}
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Informacioni i plotë i faturës, klientit, automjetit, shërbimit dhe
            pjesëve të përdorura.
          </p>
        </div>

        <InvoiceDetailsActions
          invoice={invoice}
          customers={customers}
          vehicles={vehicles}
          services={services}
        />
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <ReceiptText className="h-7 w-7" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Numri i faturës
              </p>

              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                {invoice.number}
              </p>

              <p className="mt-2 break-all text-xs text-slate-400">
                ID: {String(invoice.id).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[440px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <CalendarDays className="h-4 w-4" />

                <span className="text-xs font-semibold uppercase tracking-wide">
                  Data e krijimit
                </span>
              </div>

              <p className="mt-3 text-sm font-bold text-slate-950">
                {formatDate(invoice.createdAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-600">
                <CircleDollarSign className="h-4 w-4" />

                <span className="text-xs font-semibold uppercase tracking-wide">
                  Totali
                </span>
              </div>

              <p className="mt-3 text-xl font-bold text-blue-700">
                {formatCurrency(invoiceTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <InfoCard
          icon={Building2}
          title="Biznesi"
          description="Të dhënat e servisit që ka lëshuar faturën."
        >
          <DetailRow label="Emri" value={invoice.business?.name} />
          <DetailRow label="Adresa" value={businessAddress} />
          <DetailRow label="Telefoni" value={invoice.business?.phone} />
          <DetailRow label="Email" value={invoice.business?.email} />
        </InfoCard>

        <InfoCard
          icon={UserRound}
          title="Klienti"
          description="Klienti i lidhur me këtë faturë."
        >
          <DetailRow label="Emri" value={invoice.customer?.name} />
          <DetailRow label="Telefoni" value={invoice.customer?.phone} />
          <DetailRow label="Email" value={invoice.customer?.email} />
          <DetailRow label="Qyteti" value={invoice.customer?.city} />
        </InfoCard>

        <InfoCard
          icon={Car}
          title="Automjeti"
          description="Automjeti i faturuar."
        >
          <DetailRow label="Targa" value={invoice.vehicle?.plate} />
          <DetailRow label="Automjeti" value={vehicleName} />

          <DetailRow
            label="Viti"
            value={invoice.vehicle?.year ? String(invoice.vehicle.year) : null}
          />

          <DetailRow label="VIN" value={invoice.vehicle?.vin} />
        </InfoCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <InfoCard
          icon={Wrench}
          title="Shërbimi"
          description="Shërbimi nga i cili është krijuar fatura."
        >
          {invoice.service ? (
            <>
              <DetailRow label="Titulli" value={invoice.service.title} />

              <DetailRow
                label="Statusi"
                value={getServiceStatusLabel(invoice.service.status)}
              />

              <DetailRow
                label="Automjeti"
                value={
                  invoice.service.vehicle
                    ? `${invoice.service.vehicle.plate}${
                        serviceVehicleName ? ` — ${serviceVehicleName}` : ""
                      }`
                    : null
                }
              />

              <DetailRow
                label="Totali i shërbimit"
                value={formatCurrency(serviceTotal)}
              />

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Përshkrimi
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {invoice.service.description ||
                    "Nuk është vendosur përshkrim për këtë shërbim."}
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
              <FileText className="mx-auto h-6 w-6 text-slate-400" />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Faturë manuale
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Kjo faturë nuk është e lidhur me një shërbim.
              </p>
            </div>
          )}
        </InfoCard>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Hash className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-950">
                Përmbledhja
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Përmbledhja financiare e faturës.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500">Numri i faturës</span>

              <span className="text-sm font-semibold text-slate-900">
                {invoice.number}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500">Statusi</span>

              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusDetails.className}`}
              >
                {statusDetails.label}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500">Lloji</span>

              <span className="text-sm font-semibold text-slate-900">
                {invoice.service ? "Nga shërbimi" : "Manuale"}
              </span>
            </div>

            {invoice.service && (
              <>
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">Pjesët</span>

                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(partsTotal)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Puna</span>

                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(laborTotal)}
                  </span>
                </div>
              </>
            )}

            <div className="border-t border-slate-200 pt-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Totali për pagesë</p>

                  <p className="mt-1 text-xs text-slate-400">
                    Vlera aktuale e faturës
                  </p>
                </div>

                <p className="text-2xl font-bold tracking-tight text-slate-950">
                  {formatCurrency(invoiceTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-slate-200 px-6 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Package className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-950">
              Pjesët e përdorura
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Pjesët që janë lidhur me shërbimin e faturuar.
            </p>
          </div>
        </div>

        {partsUsed.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Package className="mx-auto h-7 w-7 text-slate-300" />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Nuk ka pjesë të regjistruara
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Shërbimi nuk ka pjesë të lidhura.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Kodi</th>
                  <th className="px-6 py-4">Pjesa</th>
                  <th className="px-6 py-4 text-right">Sasia</th>
                  <th className="px-6 py-4 text-right">Çmimi</th>
                  <th className="px-6 py-4 text-right">Totali</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {partsUsed.map((usage) => (
                  <tr
                    key={usage.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-blue-600">
                      {usage.part?.code || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {usage.part?.name || "Pjesë e panjohur"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {usage.part?.category || "Pa kategori"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-700">
                      {Number(usage.quantity || 0)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600">
                      {formatCurrency(usage.unitPrice)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-slate-950">
                      {formatCurrency(getPartLineTotal(usage))}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="border-t border-slate-200 bg-slate-50">
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-right text-sm font-semibold text-slate-600"
                  >
                    Totali i pjesëve
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-right text-base font-bold text-slate-950">
                    {formatCurrency(partsTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <History className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-950">
              Historiku i faturës
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Aktivitetet kryesore të kësaj fature.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <ReceiptText className="h-4 w-4" />
              </div>

              <div className="mt-2 h-full w-px bg-slate-200" />
            </div>

            <div className="pb-6">
              <p className="text-sm font-semibold text-slate-900">
                Fatura u krijua
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {formatDate(invoice.createdAt, true)}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                U krijua fatura {invoice.number} me vlerë{" "}
                {formatCurrency(invoiceTotal)}.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              {invoice.status === "PAID" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Clock3 className="h-4 w-4" />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Statusi aktual: {statusDetails.label}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {invoice.status === "PAID"
                  ? "Fatura është regjistruar si e paguar."
                  : invoice.status === "UNPAID"
                    ? "Fatura është në pritje të pagesës."
                    : invoice.status === "OVERDUE"
                      ? "Afati i pagesës së faturës është tejkaluar."
                      : "Fatura është ruajtur si draft."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
