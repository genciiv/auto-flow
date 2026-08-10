import Link from "next/link";
import { Bell, CheckCircle2, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, FileText, Inbox, Search, ShieldAlert } from "lucide-react";
import { requirePlatformAdmin } from "@/lib/auth-guard";
import { getAdminNotificationCenter } from "@/services/admin/admin-notification-service";
import { AdminNotificationLink, MarkAllAdminNotificationsReadButton } from "@/components/admin/notifications/AdminNotificationCenterActions";

const TYPES = [
  ["all", "Të gjitha"], ["APPLICATION", "Aplikime"], ["PLAN_REQUEST", "Kërkesa plani"], ["PAYMENT_PENDING", "Pagesa"], ["TRIAL_EXPIRING", "Trial"], ["SUBSCRIPTION_EXPIRED", "Abonime të skaduara"],
];

function iconFor(kind) { return ({ APPLICATION: FileText, PAYMENT_PENDING: CircleDollarSign, TRIAL_EXPIRING: Clock3, SUBSCRIPTION_EXPIRED: ShieldAlert }[kind] || Bell); }
function colorFor(kind) { return ({ APPLICATION: "bg-blue-50 text-blue-600", PLAN_REQUEST: "bg-cyan-50 text-cyan-600", PAYMENT_PENDING: "bg-amber-50 text-amber-600", TRIAL_EXPIRING: "bg-violet-50 text-violet-600", SUBSCRIPTION_EXPIRED: "bg-red-50 text-red-600" }[kind] || "bg-slate-100 text-slate-600"); }
function formatDate(value) { return new Intl.DateTimeFormat("sq-AL", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Tirane" }).format(new Date(value)); }
function pageUrl({ search, status, kind, page }) { const p = new URLSearchParams(); if (search) p.set("search", search); if (status && status !== "all") p.set("status", status); if (kind && kind !== "all") p.set("kind", kind); if (page > 1) p.set("page", String(page)); const q = p.toString(); return q ? `/admin/notifications?${q}` : "/admin/notifications"; }

export const metadata = { title: "Njoftimet | AutoFlow Admin" };

export default async function AdminNotificationsPage({ searchParams }) {
  const admin = await requirePlatformAdmin();
  const params = await searchParams;
  const search = typeof params?.search === "string" ? params.search.trim() : "";
  const status = ["all", "read", "unread"].includes(params?.status) ? params.status : "all";
  const kind = TYPES.some(([value]) => value === params?.kind) ? params.kind : "all";
  const data = await getAdminNotificationCenter({ userId: admin.id, search, status, kind, page: params?.page || 1, limit: 20 });

  return <div className="space-y-5 lg:space-y-7">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-semibold text-blue-600">Platform Admin</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Qendra e njoftimeve</h1><p className="mt-2 max-w-3xl text-sm text-slate-500 sm:text-base">Historiku i njoftimeve administrative, gjendja read/unread dhe veprimet që kërkojnë vëmendje.</p></div>
      <MarkAllAdminNotificationsReadButton disabled={data.unreadCount === 0} />
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Gjithsej</p><p className="mt-1 text-2xl font-bold text-slate-950">{data.totalCount}</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Të palexuara</p><p className="mt-1 text-2xl font-bold text-blue-600">{data.unreadCount}</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Rezultate me filtrat</p><p className="mt-1 text-2xl font-bold text-slate-950">{data.pagination.total}</p></div>
    </div>

    <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:grid-cols-[1fr_180px_220px_auto]">
      <label className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input name="search" defaultValue={search} placeholder="Kërko në njoftime..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-300 focus:bg-white"/></label>
      <select name="status" defaultValue={status} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">Çdo status</option><option value="unread">Të palexuara</option><option value="read">Të lexuara</option></select>
      <select name="kind" defaultValue={kind} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">{TYPES.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>
      <button className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white">Filtro</button>
    </form>

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {data.notifications.length === 0 ? <div className="px-6 py-16 text-center"><Inbox className="mx-auto text-slate-300" size={30}/><p className="mt-3 font-bold text-slate-950">Nuk ka njoftime</p><p className="mt-1 text-sm text-slate-500">Nuk u gjet asnjë njoftim me filtrat aktualë.</p></div> : <div className="divide-y divide-slate-100">{data.notifications.map((n) => { const Icon = iconFor(n.kind); return <AdminNotificationLink key={n.id} notification={n} className={`group flex w-full items-start gap-3 p-4 text-left transition hover:bg-slate-50 sm:p-5 ${!n.isRead ? "bg-blue-50/30" : ""}`}><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorFor(n.kind)}`}><Icon size={19}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-950">{n.title}</p>{!n.isRead ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">E re</span> : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400"><CheckCircle2 size={12}/>Lexuar</span>}</div>{n.subtitle ? <p className="mt-0.5 text-xs font-semibold text-blue-600">{n.subtitle}</p> : null}<p className="mt-1 text-sm leading-6 text-slate-600">{n.message}</p><p className="mt-2 text-xs text-slate-400">{formatDate(n.createdAt)}</p></div><ChevronRight size={18} className="mt-3 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"/></AdminNotificationLink>; })}</div>}
    </div>

    {data.pagination.totalPages > 1 ? <div className="flex items-center justify-between"><Link aria-disabled={data.pagination.page <= 1} href={pageUrl({ search,status,kind,page: Math.max(1,data.pagination.page-1) })} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${data.pagination.page <= 1 ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-200 text-slate-700"}`}><ChevronLeft size={16}/>Më të rejat</Link><span className="text-xs font-semibold text-slate-500">Faqja {data.pagination.page} / {data.pagination.totalPages}</span><Link aria-disabled={data.pagination.page >= data.pagination.totalPages} href={pageUrl({ search,status,kind,page: Math.min(data.pagination.totalPages,data.pagination.page+1) })} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${data.pagination.page >= data.pagination.totalPages ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-200 text-slate-700"}`}>Më të vjetrat<ChevronRight size={16}/></Link></div> : null}
  </div>;
}
