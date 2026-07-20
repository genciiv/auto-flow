import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import ApplicationActions from "@/components/admin/applications/ApplicationActions";
import { getApplicationById } from "@/services/admin/application-service";

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusConfig(status) {
  const configs = {
    PENDING: {
      label: "Në pritje",
      className: "bg-amber-50 text-amber-700",
    },
    APPROVED: {
      label: "Aprovuar",
      className: "bg-emerald-50 text-emerald-700",
    },
    REJECTED: {
      label: "Refuzuar",
      className: "bg-red-50 text-red-700",
    },
  };

  return configs[status];
}

function InformationRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 border-b border-slate-100 py-4 last:border-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default async function ApplicationDetailsPage({ params }) {
  const { applicationId } = await params;

  const application = await getApplicationById(applicationId);

  if (!application) {
    notFound();
  }

  const status = statusConfig(application.status);

  return (
    <div className="space-y-7">
      <Link
        href="/admin/applications"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />
        Kthehu te aplikimet
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
                  {application.businessName}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              <p className="mt-2 text-slate-500">
                Aplikim nga {application.ownerName}
              </p>
            </div>
          </div>

          <ApplicationActions
            applicationId={application.id}
            status={application.status}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Informacioni i aplikimit
          </h2>

          <div className="mt-5">
            <InformationRow
              icon={Building2}
              label="Biznesi"
              value={application.businessName}
            />

            <InformationRow
              icon={UserRound}
              label="Pronari"
              value={application.ownerName}
            />

            <InformationRow
              icon={Mail}
              label="Email"
              value={application.email}
            />

            <InformationRow
              icon={Phone}
              label="Telefon"
              value={application.phone}
            />

            <InformationRow
              icon={MapPin}
              label="Qyteti"
              value={application.city}
            />

            <InformationRow
              icon={MapPin}
              label="Adresa"
              value={application.address}
            />

            <InformationRow
              icon={CalendarDays}
              label="Data e aplikimit"
              value={formatDate(application.createdAt)}
            />
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Informacion shtesë
            </h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {application.notes || "Nuk është vendosur informacion shtesë."}
            </p>
          </section>

          {application.status === "REJECTED" ? (
            <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6">
              <h2 className="font-bold text-red-800">Arsyeja e refuzimit</h2>

              <p className="mt-3 text-sm leading-6 text-red-700">
                {application.rejectionReason}
              </p>
            </section>
          ) : null}

          {application.reviewedAt ? (
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-950">Shqyrtimi</h2>

              <p className="mt-3 text-sm text-slate-500">
                Shqyrtuar më {formatDate(application.reviewedAt)}
              </p>

              {application.status === "APPROVED" &&
              application.approvedBusinessId ? (
                <Link
                  href={`/admin/businesses/${application.approvedBusinessId}`}
                  className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Shiko biznesin e krijuar
                </Link>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
