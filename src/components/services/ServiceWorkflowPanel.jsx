"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { transitionServiceAction, updateServiceWorkflowAction } from "@/actions/service-workflow-actions";

const labels = { DRAFT:"Draft", PENDING:"Në pritje", IN_PROGRESS:"Në proces", WAITING_FOR_PARTS:"Në pritje të pjesëve", READY_FOR_PICKUP:"Gati për dorëzim", COMPLETED:"Përfunduar", DELIVERED:"Dorëzuar", CANCELLED:"Anuluar" };
const next = { DRAFT:["PENDING","CANCELLED"], PENDING:["IN_PROGRESS","CANCELLED"], IN_PROGRESS:["WAITING_FOR_PARTS","READY_FOR_PICKUP","COMPLETED","CANCELLED"], WAITING_FOR_PARTS:["IN_PROGRESS","READY_FOR_PICKUP","CANCELLED"], READY_FOR_PICKUP:["IN_PROGRESS","COMPLETED","DELIVERED"], COMPLETED:["DELIVERED"], DELIVERED:[], CANCELLED:[] };

export default function ServiceWorkflowPanel({ service, staff, businessRole, canManageAssignment, canManageApproval }) {
  const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  async function save(formData){setBusy(true);setMessage("");const r=await updateServiceWorkflowAction(formData);setMessage(r.message);setBusy(false);}
  async function transition(status){setBusy(true);setMessage("");const r=await transitionServiceAction(service.id,status);setMessage(r.message);setBusy(false);}
  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
    <div className="space-y-6">
      <form action={save} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Detajet e punës</h2><p className="mt-1 text-sm text-slate-500">Diagnoza, mekaniku dhe shënimet e brendshme.</p>
        <input type="hidden" name="serviceId" value={service.id}/>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div><label className="mb-2 block text-sm font-semibold text-slate-700">Mekaniku përgjegjës</label>{canManageAssignment ? <select name="assignedUserId" defaultValue={service.assignedUserId || ""} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="">Pa caktuar</option>{staff.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select> : <><input type="hidden" name="assignedUserId" value={service.assignedUserId || ""}/><div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{service.assignedUser?.name || "Pa caktuar"}</div></>}</div>
          <div className="flex items-end gap-5 pb-3">{canManageApproval ? <><label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" name="customerApprovalRequired" defaultChecked={service.customerApprovalRequired}/> Kërko miratim klienti</label><label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" name="customerApproved" defaultChecked={Boolean(service.customerApprovedAt)}/> Miratuar</label></> : <><input type="hidden" name="customerApprovalRequired" value={service.customerApprovalRequired ? "on" : ""}/><input type="hidden" name="customerApproved" value={service.customerApprovedAt ? "on" : ""}/><span className="text-sm text-slate-500">Miratimi i klientit menaxhohet nga recepsioni ose menaxheri.</span></>}</div>
          <div className="md:col-span-2"><label className="mb-2 block text-sm font-semibold text-slate-700">Diagnoza</label><textarea name="diagnosis" defaultValue={service.diagnosis || ""} rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Defekti i konstatuar dhe puna e rekomanduar..."/></div>
          <div className="md:col-span-2"><label className="mb-2 block text-sm font-semibold text-slate-700">Shënime të brendshme</label><textarea name="internalNotes" defaultValue={service.internalNotes || ""} rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder={businessRole === "MECHANIC" ? "Shënime teknike për ekipin..." : "Shënime vetëm për ekipin..."}/></div>
        </div>
        <div className="mt-5 flex justify-end"><button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-60">{busy&&<Loader2 size={16} className="animate-spin"/>}Ruaj detajet</button></div>
      </form>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-950">Historiku i statusit</h2><div className="mt-5 space-y-4">{service.statusHistory.length===0?<p className="text-sm text-slate-500">Nuk ka ende ndryshime statusi.</p>:service.statusHistory.map(h=><div key={h.id} className="border-l-2 border-blue-200 pl-4"><p className="text-sm font-semibold text-slate-900">{labels[h.fromStatus] || "Krijuar"} → {labels[h.toStatus]}</p><p className="mt-1 text-xs text-slate-500">{h.changedBy?.name || "Sistemi"} · {new Date(h.createdAt).toLocaleString("sq-AL")}</p>{h.note&&<p className="mt-1 text-sm text-slate-600">{h.note}</p>}</div>)}</div></div>
    </div>
    <div className="space-y-6"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-950">Hapi i radhës</h2><p className="mt-1 text-sm text-slate-500">Lejohen vetëm kalimet e sigurta të workflow-t.</p><div className="mt-5 grid gap-3">{next[service.status].length===0?<p className="text-sm text-slate-500">Ky workflow është mbyllur.</p>:next[service.status].map(s=><button key={s} type="button" disabled={busy} onClick={()=>transition(s)} className="rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-60">Kalo në: {labels[s]}</button>)}</div>{message&&<p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</p>}</div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-950">Afatet</h2><div className="mt-4 space-y-3 text-sm"><DateRow label="Filluar" value={service.startedAt}/><DateRow label="Gati" value={service.readyAt}/><DateRow label="Përfunduar" value={service.completedAt}/><DateRow label="Dorëzuar" value={service.deliveredAt}/></div></div>
    </div>
  </div>;
}
function DateRow({label,value}){return <div className="flex justify-between gap-3"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-800">{value?new Date(value).toLocaleString("sq-AL"):"—"}</span></div>}
