"use client";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { CalendarDays, Download, FileText, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { createCustomerVehicleDocument, deleteCustomerVehicleDocument } from "@/app/customer/vehicles/document-actions";
import { CUSTOMER_VEHICLE_DOCUMENT_OPTIONS, CUSTOMER_VEHICLE_DOCUMENT_REMINDER_DAYS } from "@/config/customer-vehicle-documents";
import { useConfirm } from "@/components/feedback/ConfirmProvider";
import { useToast } from "@/components/feedback/ToastProvider";

const initialState={success:false,message:'',errors:{}};
const fmt=(d)=>d?new Intl.DateTimeFormat('sq-AL',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(d)):'Pa afat';

function DeleteButton({vehicleId,documentId}){
 const {confirm}=useConfirm(); const toast=useToast(); const [pending,startTransition]=useTransition();
 async function run(){ if(!await confirm({title:'Fshi dokumentin',description:'Skedari dhe kujtesa e lidhur do të fshihen.',confirmLabel:'Fshi',tone:'danger'})) return; startTransition(async()=>{const r=await deleteCustomerVehicleDocument(vehicleId,documentId); r.success?toast.success(r.message):toast.error(r.message);}); }
 return <button type="button" onClick={run} disabled={pending} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50">{pending?<LoaderCircle size={15} className="animate-spin"/>:<Trash2 size={15}/>}</button>
}

export default function CustomerVehicleDocuments({vehicleId,documents=[]}){
 const ref=useRef(null); const [state,action,pending]=useActionState(createCustomerVehicleDocument,initialState);
 useEffect(()=>{if(state.success) ref.current?.reset();},[state.success]);
 return <section id="documents" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
  <div className="border-b border-slate-100 px-5 py-5 sm:px-6"><div className="flex items-center gap-2 text-blue-600"><FileText size={17}/><p className="text-xs font-black uppercase tracking-[.16em]">Dokumentet</p></div><h2 className="mt-2 text-lg font-bold text-slate-950">Dosja e dokumenteve</h2><p className="mt-1 text-sm text-slate-500">PDF ose imazh privat. Dokumentet me skadim krijojnë kujtesë automatike.</p></div>
  <div className="grid gap-6 p-5 lg:grid-cols-[.9fr_1.1fr] sm:p-6">
   <form ref={ref} action={action} className="space-y-4">
    <input type="hidden" name="vehicleId" value={vehicleId}/>
    {state.message?<p className={`rounded-xl px-3 py-2 text-sm ${state.success?'bg-emerald-50 text-emerald-700':'bg-red-50 text-red-700'}`}>{state.message}</p>:null}
    <select name="type" defaultValue="INSURANCE" className="h-11 w-full rounded-xl border border-slate-200 px-3">{CUSTOMER_VEHICLE_DOCUMENT_OPTIONS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
    <input name="title" placeholder="Titull opsional" maxLength={120} className="h-11 w-full rounded-xl border border-slate-200 px-3"/>
    <input name="file" type="file" required accept="application/pdf,image/jpeg,image/png,image/webp" className="block w-full rounded-xl border border-slate-200 p-3 text-sm"/>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold text-slate-600">Lëshuar më<input name="issuedAt" type="date" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3"/></label><label className="text-xs font-bold text-slate-600">Skadon më<input name="expiresAt" type="date" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3"/></label></div>
    <label className="block text-xs font-bold text-slate-600">Njofto para skadimit<select name="remindDaysBefore" defaultValue="30" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3">{CUSTOMER_VEHICLE_DOCUMENT_REMINDER_DAYS.map(d=><option key={d} value={d}>{d} ditë</option>)}</select></label>
    <textarea name="notes" rows={2} maxLength={1000} placeholder="Shënim opsional" className="w-full rounded-xl border border-slate-200 p-3"/>
    <button disabled={pending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-bold text-white hover:bg-blue-600">{pending?<LoaderCircle size={16} className="animate-spin"/>:<Plus size={16}/>}Ngarko dokumentin</button>
   </form>
   <div className="space-y-3">{documents.length?documents.map(doc=><div key={doc.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FileText size={17}/></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{doc.title}</p><p className="mt-1 text-xs text-slate-500">{doc.fileName} · {(doc.sizeBytes/1024/1024).toFixed(2)} MB</p><p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-600"><CalendarDays size={12}/>Skadimi: {fmt(doc.expiresAt)}</p></div><a href={`/api/customer/vehicles/${vehicleId}/documents/${doc.id}/download`} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Shkarko"><Download size={15}/></a><DeleteButton vehicleId={vehicleId} documentId={doc.id}/></div>):<div className="rounded-2xl border border-dashed border-slate-200 px-5 py-12 text-center text-sm text-slate-500">Nuk ka dokumente të ngarkuara.</div>}</div>
  </div>
 </section>
}
