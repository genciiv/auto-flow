import Link from "next/link";
import { ArrowRight, Calendar, ClipboardList, Coins, Package, ReceiptText, Users, Wrench } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

const ROLE_COPY = {
  OWNER: ["Workspace i pronarit", "Pamja e plotë e biznesit dhe ekipit."],
  MANAGER: ["Workspace i menaxherit", "Koordino klientët, punët, stafin dhe ecurinë ditore."],
  RECEPTIONIST: ["Workspace i recepsionit", "Regjistro klientët, automjetet, terminet dhe dorëzimet."],
  MECHANIC: ["Workspace i mekanikut", "Puno vetëm me urdhër-punët që të janë caktuar."],
  WAREHOUSE: ["Workspace i magazinës", "Kontrollo stokun, pjesët e përdorura dhe porositë."],
  ACCOUNTANT: ["Workspace i financës", "Menaxho faturat, pagesat dhe detyrimet e klientëve."],
};

const ACTIONS = {
  OWNER: [["Stafi", "/dashboard/staff", Users], ["Shërbimet", "/dashboard/services", Wrench], ["Faturat", "/dashboard/invoices", ReceiptText], ["Audit Log", "/dashboard/audit-log", ClipboardList]],
  MANAGER: [["Klient i ri", "/dashboard/customers", Users], ["Urdhër-punët", "/dashboard/services", Wrench], ["Terminet", "/dashboard/appointments", Calendar], ["Aktiviteti", "/dashboard/audit-log", ClipboardList]],
  RECEPTIONIST: [["Regjistro klient", "/dashboard/customers", Users], ["Regjistro automjet", "/dashboard/vehicles", Wrench], ["Krijo termin", "/dashboard/appointments", Calendar], ["Faturat", "/dashboard/invoices", ReceiptText]],
  MECHANIC: [["Punët e mia", "/dashboard/my-work", Wrench], ["Shërbimet", "/dashboard/services", ClipboardList], ["Inventari", "/dashboard/inventory", Package]],
  WAREHOUSE: [["Inventari", "/dashboard/inventory", Package], ["Lëvizjet e stokut", "/dashboard/inventory/movements", ClipboardList], ["Porositë", "/dashboard/purchases", ReceiptText]],
  ACCOUNTANT: [["Faturat", "/dashboard/invoices", ReceiptText], ["Pagesat", "/dashboard/invoices", Coins], ["Financa & Raporte", "/dashboard/finance", Coins], ["Audit Log", "/dashboard/audit-log", ClipboardList]],
};

export default async function WorkspacePage() {
  const { businessId, businessRole, userId } = await requireBusinessContext();
  const serviceWhere = { businessId, ...(businessRole === "MECHANIC" ? { assignedUserId: userId } : {}) };
  const [activeServices, readyServices, todayAppointments, lowStock, unpaidInvoices, recentActivity] = await Promise.all([
    db.serviceRecord.count({ where: { ...serviceWhere, status: { in: ["PENDING", "IN_PROGRESS", "WAITING_FOR_PARTS"] } } }),
    db.serviceRecord.count({ where: { ...serviceWhere, status: "READY_FOR_PICKUP" } }),
    db.appointment.count({ where: { businessId, date: { gte: new Date(new Date().setHours(0,0,0,0)), lte: new Date(new Date().setHours(23,59,59,999)) } } }),
    db.part.count({ where: { businessId, stock: { lte: 5 } } }),
    db.invoice.count({ where: { businessId, status: { in: ["UNPAID", "OVERDUE"] } } }),
    db.auditLog.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name:true } } } }),
  ]);
  const [title, description] = ROLE_COPY[businessRole] || ["Workspace", "Puna jote e përditshme në AutoFlow."];
  const stats = businessRole === "WAREHOUSE"
    ? [["Stok i ulët", lowStock, Package], ["Punë që presin pjesë", await db.serviceRecord.count({ where:{ businessId, status:"WAITING_FOR_PARTS" } }), Wrench], ["Porosi aktive", await db.purchaseOrder.count({ where:{ businessId, status:{ in:["PENDING","ORDERED"] } } }), ReceiptText]]
    : businessRole === "ACCOUNTANT"
      ? [["Fatura pa paguar", unpaidInvoices, ReceiptText], ["Pagesa sot", await db.customerPayment.count({ where:{ businessId, paidAt:{ gte:new Date(new Date().setHours(0,0,0,0)) } } }), Coins], ["Fatura të paguara", await db.invoice.count({ where:{ businessId, status:"PAID" } }), ClipboardList]]
      : [["Punë aktive", activeServices, Wrench], ["Gati për dorëzim", readyServices, ClipboardList], ["Termine sot", todayAppointments, Calendar]];

  return <DashboardLayout><div className="af-page-stack">
    <div className="af-page-header"><div><p className="af-page-eyebrow">Roli: {businessRole}</p><h1 className="af-page-title">{title}</h1><p className="af-page-description">{description}</p></div><div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:flex"><Users size={22} /></div></div>
    <div className="grid gap-4 md:grid-cols-3">{stats.map(([label,value,Icon])=><div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Icon className="text-blue-600" size={22}/><p className="mt-4 text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold text-slate-950">{value}</p></div>)}</div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{(ACTIONS[businessRole]||[]).map(([label,href,Icon])=><Link key={label} href={href} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><Icon className="text-blue-600" size={22}/><div className="mt-4 flex items-center justify-between"><strong>{label}</strong><ArrowRight className="transition group-hover:translate-x-1" size={17}/></div></Link>)}</div>
    {businessRole !== "MECHANIC" ? <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Aktiviteti i fundit i ekipit</h2><div className="mt-4 divide-y divide-slate-100">{recentActivity.length?recentActivity.map(item=><div key={item.id} className="py-3"><p className="text-sm font-semibold text-slate-900">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.user?.name||"Sistemi"} · {new Intl.DateTimeFormat("sq-AL", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Tirane" }).format(new Date(item.createdAt))}</p></div>):<p className="py-4 text-sm text-slate-500">Nuk ka aktivitet.</p>}</div></section>:null}
  </div></DashboardLayout>;
}
