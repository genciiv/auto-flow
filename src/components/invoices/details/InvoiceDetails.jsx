import {
  Building2,
  CalendarDays,
  Car,
  CircleDollarSign,
  FileText,
  Hash,
  ReceiptText,
  UserRound,
  Wrench,
} from "lucide-react";

import InvoiceDetailsActions from "./InvoiceDetailsActions";

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

function formatCurrency(value) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
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
  }).format(date);
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="text-right text-sm font-medium text-slate-900">
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
            Shiko informacionin e plotë të faturës, klientit, automjetit dhe
            shërbimit të lidhur.
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

              <p className="mt-2 text-xs text-slate-400">
                ID: {String(invoice.id).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[420px]">
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
                {formatCurrency(invoice.total)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <InfoCard
          icon={Building2}
          title="Biznesi"
          description="Të dhënat e servis-it që ka lëshuar faturën."
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
                value={
                  invoice.service.status === "COMPLETED"
                    ? "I përfunduar"
                    : invoice.service.status === "IN_PROGRESS"
                      ? "Në proces"
                      : invoice.service.status === "CANCELLED"
                        ? "I anuluar"
                        : "Në pritje"
                }
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
                value={formatCurrency(invoice.service.total)}
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
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Numri i faturës</span>

              <span className="text-sm font-semibold text-slate-900">
                {invoice.number}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Statusi</span>

              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusDetails.className}`}
              >
                {statusDetails.label}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Lloji</span>

              <span className="text-sm font-semibold text-slate-900">
                {invoice.service ? "Nga shërbimi" : "Manuale"}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Totali për pagesë</p>

                  <p className="mt-1 text-xs text-slate-400">
                    Vlera aktuale e faturës
                  </p>
                </div>

                <p className="text-2xl font-bold tracking-tight text-slate-950">
                  {formatCurrency(invoice.total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-blue-100 bg-blue-50/60 p-5">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <p className="text-sm font-semibold text-blue-900">
              Faza e ardhshme e modulit
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-700">
              Në commit-in tjetër do të shtojmë tabelën e pjesëve, punën,
              subtotalin, TVSH-në dhe totalet e detajuara.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
