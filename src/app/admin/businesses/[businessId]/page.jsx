import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Car,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  UserRound,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

import BusinessStatusButton from "@/components/admin/businesses/BusinessStatusButton";
import {
  getBusinessById,
  getBusinessFinancialSummary,
} from "@/services/admin/business-service";

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatMoney(value) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function roleLabel(role) {
  const labels = {
    OWNER: "Pronar",
    MANAGER: "Menaxher",
    MECHANIC: "Mekanik",
    RECEPTIONIST: "Recepsionist",
    WAREHOUSE: "Magazinier",
    ACCOUNTANT: "Financier",
  };

  return labels[role] || role;
}

function serviceStatusLabel(status) {
  const labels = {
    PENDING: "Në pritje",
    IN_PROGRESS: "Në proces",
    COMPLETED: "Përfunduar",
    CANCELLED: "Anuluar",
  };

  return labels[status] || status;
}

function invoiceStatusLabel(status) {
  const labels = {
    DRAFT: "Draft",
    PAID: "Paguar",
    UNPAID: "Papaguar",
    OVERDUE: "Me vonesë",
  };

  return labels[status] || status;
}

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={19} />
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default async function BusinessDetailsPage({ params }) {
  const { businessId } = await params;

  const [business, financialSummary] = await Promise.all([
    getBusinessById(businessId),
    getBusinessFinancialSummary(businessId),
  ]);

  if (!business) {
    notFound();
  }

  const owner = business.users.find(
    (businessUser) => businessUser.role === "OWNER",
  );

  return (
    <div className="space-y-7">
      <Link
        href="/admin/businesses"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />
        Kthehu te bizneset
      </Link>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Building2 size={26} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                  {business.name}
                </h1>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    business.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {business.isActive ? "Aktiv" : "Joaktiv"}
                </span>
              </div>

              <p className="mt-2 text-slate-500">
                Regjistruar më {formatDate(business.createdAt)}
              </p>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />

                  {business.city || "Qyteti i pacaktuar"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" />

                  {business.phone || "Telefon i pacaktuar"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" />

                  {business.email || "Email i pacaktuar"}
                </span>
              </div>
            </div>
          </div>

          <BusinessStatusButton
            businessId={business.id}
            isActive={business.isActive}
          />
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Klientë"
          value={business._count.customers}
          description="Klientë të regjistruar"
          icon={Users}
        />

        <StatCard
          title="Automjete"
          value={business._count.vehicles}
          description="Automjete të regjistruara"
          icon={Car}
        />

        <StatCard
          title="Shërbime"
          value={business._count.services}
          description={`${financialSummary.serviceCount} shërbime në total`}
          icon={Wrench}
        />

        <StatCard
          title="Të ardhura"
          value={formatMoney(financialSummary.paidRevenue)}
          description={`${financialSummary.paidInvoiceCount} fatura të paguara`}
          icon={Wallet}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Informacioni i biznesit
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Të dhënat bazë të servis-it.
            </p>
          </div>

          <div className="mt-6 divide-y divide-slate-100">
            <div className="flex items-start justify-between gap-6 py-4 first:pt-0">
              <span className="text-sm text-slate-500">Emri</span>

              <span className="text-right text-sm font-semibold text-slate-800">
                {business.name}
              </span>
            </div>

            <div className="flex items-start justify-between gap-6 py-4">
              <span className="text-sm text-slate-500">Qyteti</span>

              <span className="text-right text-sm font-semibold text-slate-800">
                {business.city || "—"}
              </span>
            </div>

            <div className="flex items-start justify-between gap-6 py-4">
              <span className="text-sm text-slate-500">Adresa</span>

              <span className="max-w-sm text-right text-sm font-semibold text-slate-800">
                {business.address || "—"}
              </span>
            </div>

            <div className="flex items-start justify-between gap-6 py-4">
              <span className="text-sm text-slate-500">Telefoni</span>

              <span className="text-right text-sm font-semibold text-slate-800">
                {business.phone || "—"}
              </span>
            </div>

            <div className="flex items-start justify-between gap-6 py-4">
              <span className="text-sm text-slate-500">Email</span>

              <span className="text-right text-sm font-semibold text-slate-800">
                {business.email || "—"}
              </span>
            </div>

            <div className="flex items-start justify-between gap-6 py-4">
              <span className="text-sm text-slate-500">Pronari</span>

              <span className="text-right text-sm font-semibold text-slate-800">
                {owner?.user?.name || "Pa pronar"}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Përmbledhje financiare
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Vlerat e faturave dhe shërbimeve.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Totali i faturuar</p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {formatMoney(financialSummary.invoiceTotal)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {financialSummary.invoiceCount} fatura
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Të ardhura të paguara</p>

              <p className="mt-2 text-2xl font-bold text-emerald-900">
                {formatMoney(financialSummary.paidRevenue)}
              </p>

              <p className="mt-1 text-xs text-emerald-700">
                {financialSummary.paidInvoiceCount} fatura të paguara
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-sm text-blue-700">Vlera e shërbimeve</p>

              <p className="mt-2 text-2xl font-bold text-blue-900">
                {formatMoney(financialSummary.serviceTotal)}
              </p>

              <p className="mt-1 text-xs text-blue-700">
                {financialSummary.serviceCount} shërbime
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-950">Stafi</h2>

          <p className="mt-1 text-sm text-slate-500">
            Përdoruesit e lidhur me këtë biznes.
          </p>
        </div>

        {business.users.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {business.users.map((businessUser) => (
              <div
                key={businessUser.id}
                className="flex flex-col justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <UserRound size={20} />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-950">
                      {businessUser.user.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {businessUser.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {roleLabel(businessUser.role)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      businessUser.isActive && businessUser.user.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {businessUser.isActive && businessUser.user.isActive
                      ? "Aktiv"
                      : "Joaktiv"}
                  </span>

                  <span className="text-xs text-slate-500">
                    Hyrja e fundit: {formatDate(businessUser.user.lastLoginAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Nuk ka përdorues të lidhur me këtë biznes.
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">
              Klientët e fundit
            </h2>
          </div>

          {business.customers.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {business.customers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {customer.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {customer.phone || customer.email || "Pa kontakt"}
                    </p>
                  </div>

                  <span className="text-xs text-slate-500">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Nuk ka ende klientë.
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">
              Automjetet e fundit
            </h2>
          </div>

          {business.vehicles.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {business.vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {vehicle.brand} {vehicle.model || ""}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {vehicle.plate}
                      {vehicle.customer?.name
                        ? ` · ${vehicle.customer.name}`
                        : ""}
                    </p>
                  </div>

                  <span className="text-xs text-slate-500">
                    {vehicle.year || "—"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Nuk ka ende automjete.
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">
              Shërbimet e fundit
            </h2>
          </div>

          {business.services.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {business.services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {service.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {service.vehicle.brand} {service.vehicle.model || ""} ·{" "}
                      {service.vehicle.plate}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      {formatMoney(service.total)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {serviceStatusLabel(service.status)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Nuk ka ende shërbime.
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">
              Faturat e fundit
            </h2>
          </div>

          {business.invoices.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {business.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {invoice.number}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {invoice.customer?.name || "Pa klient"} ·{" "}
                      {invoiceStatusLabel(invoice.status)}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-800">
                    {formatMoney(invoice.total)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Nuk ka ende fatura.
            </div>
          )}
        </section>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <CalendarDays className="text-blue-600" />

          <p className="mt-4 text-2xl font-bold text-slate-950">
            {business._count.appointments}
          </p>

          <p className="mt-1 text-sm text-slate-500">Termine</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <Package className="text-blue-600" />

          <p className="mt-4 text-2xl font-bold text-slate-950">
            {business._count.parts}
          </p>

          <p className="mt-1 text-sm text-slate-500">Pjesë në magazinë</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <FileText className="text-blue-600" />

          <p className="mt-4 text-2xl font-bold text-slate-950">
            {business._count.invoices}
          </p>

          <p className="mt-1 text-sm text-slate-500">Fatura</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <ShoppingCart className="text-blue-600" />

          <p className="mt-4 text-2xl font-bold text-slate-950">
            {business._count.purchaseOrders}
          </p>

          <p className="mt-1 text-sm text-slate-500">Porosi furnizimi</p>
        </div>
      </section>
    </div>
  );
}
