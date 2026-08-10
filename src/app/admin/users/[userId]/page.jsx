import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import UserAdminActions from "@/components/admin/users/UserAdminActions";
import { getAdminUserById } from "@/services/admin/user-service";

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("sq-AL", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function businessRoleLabel(role) {
  const labels = { OWNER: "Pronar", MANAGER: "Menaxher", MECHANIC: "Mekanik", RECEPTIONIST: "Recepsionist", WAREHOUSE: "Magazinier", ACCOUNTANT: "Financier" };
  return labels[role] || role;
}

function InfoRow({ label, children }) {
  return <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"><span className="text-xs font-medium text-slate-500 sm:text-sm">{label}</span><div className="text-sm font-semibold text-slate-800 sm:text-right">{children}</div></div>;
}

export default async function AdminUserDetailsPage({ params }) {
  const { userId } = await params;
  const [admin, user] = await Promise.all([requirePlatformAdmin(), getAdminUserById(userId)]);
  if (!user) notFound();

  const isLocked = Boolean(user.lockedUntil && new Date(user.lockedUntil) > new Date());
  const accessLabels = [
    user.globalRole === "PLATFORM_ADMIN" ? "Platform Admin" : null,
    user.globalRole === "CUSTOMER" ? "Customer" : null,
    user.businesses.length ? "Business" : null,
  ].filter(Boolean);

  return (
    <div className="space-y-5 sm:space-y-7">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"><ArrowLeft size={17} /> Kthehu te përdoruesit</Link>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white sm:h-14 sm:w-14"><UserRound size={24} /></div>
            <div>
              <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{user.name}</h1><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{user.isActive ? "Aktiv" : "Joaktiv"}</span>{isLocked ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">I bllokuar</span> : null}</div>
              <p className="mt-2 text-sm text-slate-500">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">{accessLabels.map((label) => <span key={label} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{label}</span>)}{!accessLabels.length ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Pa akses aktiv</span> : null}</div>
            </div>
          </div>
          <div className="text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> Regjistruar {formatDateTime(user.createdAt)}</span></div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="space-y-5">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-slate-950">Informacioni i llogarisë</h2>
            <p className="mt-1 text-sm text-slate-500">Identiteti, verifikimi dhe aktiviteti i fundit.</p>
            <div className="mt-5">
              <InfoRow label="Email"><span className="inline-flex items-center gap-2"><Mail size={15} className="text-slate-400" />{user.email}</span></InfoRow>
              <InfoRow label="Telefon"><span className="inline-flex items-center gap-2"><Phone size={15} className="text-slate-400" />{user.phone || "—"}</span></InfoRow>
              <InfoRow label="Email i verifikuar"><span className={user.emailVerified ? "text-emerald-700" : "text-amber-700"}>{user.emailVerified ? formatDateTime(user.emailVerified) : "Jo"}</span></InfoRow>
              <InfoRow label="Hyrja e fundit"><span className="inline-flex items-center gap-2"><Clock3 size={15} className="text-slate-400" />{formatDateTime(user.lastLoginAt)}</span></InfoRow>
              <InfoRow label="Tentativa të dështuara">{user.failedLoginAttempts}</InfoRow>
              <InfoRow label="Tentativa e fundit e dështuar">{formatDateTime(user.lastFailedLoginAt)}</InfoRow>
              <InfoRow label="Bllokuar deri">{formatDateTime(user.lockedUntil)}</InfoRow>
              <InfoRow label="Session version">{user.sessionVersion}</InfoRow>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4"><div><h2 className="font-bold text-slate-950">Aksesi në biznese</h2><p className="mt-1 text-sm text-slate-500">Rolet tenant menaxhohen nga biznesi, ndërsa Platform Admin i monitoron këtu.</p></div><Building2 size={20} className="text-slate-400" /></div>
            <div className="mt-5 space-y-3">
              {user.businesses.length ? user.businesses.map((membership) => (
                <Link key={membership.id} href={`/admin/businesses/${membership.business.id}`} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-semibold text-slate-900">{membership.business.name}</p><p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={13} />{membership.business.city || "Qyteti i pacaktuar"}</p></div>
                  <div className="flex flex-wrap gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{businessRoleLabel(membership.role)}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${membership.isActive && membership.business.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{membership.isActive && membership.business.isActive ? "Akses aktiv" : "Akses joaktiv"}</span></div>
                </Link>
              )) : <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Ky përdorues nuk është i lidhur me asnjë biznes.</div>}
            </div>
          </section>

          {user.customerProfile ? (
            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-blue-600" /><h2 className="font-bold text-slate-950">Profili Customer</h2></div>
              <div className="mt-4"><InfoRow label="Emri">{[user.customerProfile.firstName, user.customerProfile.lastName].filter(Boolean).join(" ") || "—"}</InfoRow><InfoRow label="Telefon">{user.customerProfile.phone || "—"}</InfoRow><InfoRow label="Qyteti">{user.customerProfile.city || "—"}</InfoRow><InfoRow label="Adresa">{user.customerProfile.address || "—"}</InfoRow></div>
            </section>
          ) : null}
        </div>

        <div className="space-y-5">
          <UserAdminActions
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              isActive: user.isActive,
              globalRole: user.globalRole,
              emailVerified: Boolean(user.emailVerified),
              failedLoginAttempts: user.failedLoginAttempts,
              isLocked,
              hasPassword: user.hasPassword,
              canDelete: user.canDelete,
              deleteBlockers: user.deleteBlockers,
            }}
            currentAdminId={admin.id}
            memberships={user.businesses.map((membership) => ({
              id: membership.id,
              role: membership.role,
              isActive: membership.isActive && membership.business.isActive,
              businessName: membership.business.name,
            }))}
          />
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-slate-400" /><h2 className="font-bold text-slate-950">Gjurmueshmëria</h2></div>
            <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Audit logs</p><p className="mt-1 text-xl font-bold text-slate-900">{user._count.auditLogs}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Njoftime</p><p className="mt-1 text-xl font-bold text-slate-900">{user._count.notifications}</p></div></div>
            <Link href={`/admin/activity-logs?search=${encodeURIComponent(user.email)}`} className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">Shiko aktivitetin →</Link>
          </section>
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><Activity size={18} className="text-slate-400" /><h2 className="font-bold text-slate-950">Aktiviteti i sigurisë</h2></div>
            <p className="mt-1 text-xs text-slate-500">Hyrje të dështuara dhe veprime administrative të fundit mbi llogarinë.</p>
            <div className="mt-4 space-y-3">
              {user.recentSecurityEvents.length ? user.recentSecurityEvents.map((event) => (
                <div key={event.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-slate-800">{event.title}</p><span className="shrink-0 text-[11px] text-slate-400">{formatDateTime(event.createdAt)}</span></div>
                  {event.description ? <p className="mt-1 text-xs text-slate-500">{event.description}</p> : null}
                </div>
              )) : <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">Nuk ka evente sigurie të regjistruara.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
