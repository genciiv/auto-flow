import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import { getAdminUsers } from "@/services/admin/user-service";

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function businessRoleLabel(role) {
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

function SummaryCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-10 sm:w-10"><Icon size={18} /></div>
      <p className="mt-4 text-xs font-medium text-slate-500 sm:text-sm">{title}</p>
      <p className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function createPageUrl(filters, page) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.access !== "all") params.set("access", filters.access);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

export const metadata = {
  title: "Përdoruesit | AutoFlow Admin",
  description: "Menaxho llogaritë dhe aksesin e përdoruesve të AutoFlow.",
};

export default async function AdminUsersPage({ searchParams }) {
  const params = await searchParams;
  const data = await getAdminUsers({
    search: typeof params?.search === "string" ? params.search : "",
    status: typeof params?.status === "string" ? params.status : "all",
    access: typeof params?.access === "string" ? params.access : "all",
    page: params?.page || 1,
  });

  const { users, counts, filters, pagination } = data;
  const now = new Date();

  return (
    <div className="space-y-5 sm:space-y-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Platform Admin</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Përdoruesit</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Kontrollo llogaritë Customer, stafin e bizneseve dhe administratorët e platformës nga një vend i vetëm.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        <SummaryCard title="Totali" value={counts.total} description={`${counts.active} aktive`} icon={UsersRound} />
        <SummaryCard title="Customer" value={counts.customers} description="Akses në portalin personal" icon={UserRoundCheck} />
        <SummaryCard title="Përdorues biznesi" value={counts.business} description="Të lidhur me të paktën një biznes" icon={CheckCircle2} />
        <SummaryCard title="Platform Admin" value={counts.admins} description={`${counts.locked} llogari të bllokuara`} icon={ShieldCheck} />
      </div>

      <form className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_190px_auto]">
          <label className="relative">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input name="search" defaultValue={filters.search} placeholder="Kërko emër, email, telefon ose biznes..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" />
          </label>

          <select name="access" defaultValue={filters.access} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100">
            <option value="all">Çdo lloj aksesi</option>
            <option value="platform_admin">Platform Admin</option>
            <option value="customer">Customer</option>
            <option value="business">Përdorues biznesi</option>
          </select>

          <select name="status" defaultValue={filters.status} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100">
            <option value="all">Çdo status</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Joaktiv</option>
            <option value="locked">I bllokuar</option>
            <option value="unverified">Email i paverifikuar</option>
          </select>

          <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"><SlidersHorizontal size={16} /> Filtro</button>
        </div>
        {(filters.search || filters.status !== "all" || filters.access !== "all") ? <Link href="/admin/users" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700">Pastro filtrat</Link> : null}
      </form>

      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        {users.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead><tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  {['Përdoruesi','Aksesi','Bizneset','Verifikimi','Statusi','Hyrja e fundit','Veprime'].map((label) => <th key={label} className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</th>)}
                </tr></thead>
                <tbody>
                  {users.map((user) => {
                    const isLocked = user.lockedUntil && new Date(user.lockedUntil) > now;
                    return (
                      <tr key={user.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                        <td className="px-5 py-4"><p className="font-semibold text-slate-900">{user.name}</p><p className="mt-1 text-xs text-slate-500">{user.email}</p></td>
                        <td className="px-5 py-4"><div className="flex flex-wrap gap-1.5">{user.globalRole === "PLATFORM_ADMIN" ? <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">Platform Admin</span> : null}{user.globalRole === "CUSTOMER" ? <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Customer</span> : null}{user.businesses.length ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">Business</span> : null}{!user.globalRole && !user.businesses.length ? <span className="text-xs text-slate-400">Pa akses</span> : null}</div></td>
                        <td className="px-5 py-4"><div className="space-y-1">{user.businesses.slice(0,2).map((membership) => <p key={membership.id} className="text-xs text-slate-600"><span className="font-semibold text-slate-800">{membership.business.name}</span> · {businessRoleLabel(membership.role)}</p>)}{user.businesses.length > 2 ? <p className="text-xs text-slate-400">+{user.businesses.length - 2} të tjera</p> : null}{!user.businesses.length ? <span className="text-xs text-slate-400">—</span> : null}</div></td>
                        <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.emailVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{user.emailVerified ? "Verifikuar" : "Pa verifikuar"}</span></td>
                        <td className="px-5 py-4"><div className="flex flex-col items-start gap-1.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{user.isActive ? "Aktiv" : "Joaktiv"}</span>{isLocked ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">I bllokuar</span> : null}</div></td>
                        <td className="px-5 py-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><Clock3 size={14} />{formatDateTime(user.lastLoginAt)}</span></td>
                        <td className="px-5 py-4"><Link href={`/admin/users/${user.id}`} className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">Detaje</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-slate-500">{pagination.totalItems} rezultate · Faqja {pagination.currentPage} nga {pagination.totalPages}</p>
              <div className="flex gap-2">
                <Link href={createPageUrl(filters, Math.max(1, pagination.currentPage - 1))} aria-disabled={pagination.currentPage <= 1} className={`inline-flex h-9 items-center gap-1 rounded-xl border px-3 text-xs font-semibold ${pagination.currentPage <= 1 ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}><ChevronLeft size={15} /> Mbrapa</Link>
                <Link href={createPageUrl(filters, Math.min(pagination.totalPages, pagination.currentPage + 1))} aria-disabled={pagination.currentPage >= pagination.totalPages} className={`inline-flex h-9 items-center gap-1 rounded-xl border px-3 text-xs font-semibold ${pagination.currentPage >= pagination.totalPages ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>Para <ChevronRight size={15} /></Link>
              </div>
            </div>
          </>
        ) : <div className="px-6 py-16 text-center"><UsersRound size={32} className="mx-auto text-slate-300" /><h2 className="mt-4 font-bold text-slate-900">Nuk u gjet asnjë përdorues</h2><p className="mt-2 text-sm text-slate-500">Ndrysho filtrat ose provo një kërkim tjetër.</p></div>}
      </section>
    </div>
  );
}
