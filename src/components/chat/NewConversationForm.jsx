"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCirclePlus } from "lucide-react";

const initialState = { success: false, message: "" };

export default function NewConversationForm({ contacts, services = [], action, mode }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(async (previous, formData) => {
    const result = await action(previous, formData);
    if (result?.conversationId) router.push(`${mode === "business" ? "/dashboard" : "/customer"}/messages/${result.conversationId}`);
    return result;
  }, initialState);

  if (!contacts.length) return <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">Nuk ka ende automjete të lidhura dhe të aprovuara për të hapur bisedë.</div>;

  return <form action={formAction} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
    <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><MessageCirclePlus size={20}/></div><div><h2 className="font-bold text-slate-950">Bisedë e re</h2><p className="text-sm text-slate-500">Zgjidh automjetin e lidhur dhe dërgo mesazhin e parë.</p></div></div>
    {mode === "business" ? <select name="customerProfileId" required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="">Zgjidh klientin...</option>{contacts.map(c => <option key={c.key} value={c.customerProfileId}>{c.customerName} · {c.vehicleLabel}</option>)}</select> : null}
    <select name="vehicleId" required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="">Zgjidh automjetin...</option>{contacts.map(c => <option key={c.key} value={c.vehicleId}>{mode === "customer" ? `${c.businessName} · ` : ""}{c.vehicleLabel}</option>)}</select>
    {services.length ? <select name="serviceId" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="">Pa shërbim specifik</option>{services.map(service => <option key={service.id} value={service.id}>{service.title} · {service.vehicleLabel}</option>)}</select> : null}
    <input name="subject" maxLength={120} placeholder="Subjekti (opsional)" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"/>
    <textarea name="body" required maxLength={4000} rows={4} placeholder="Shkruaj mesazhin..." className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm"/>
    {state?.message && !state.success ? <p className="text-sm font-semibold text-red-600">{state.message}</p> : null}
    <button disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{pending ? <Loader2 className="animate-spin" size={17}/> : <MessageCirclePlus size={17}/>}Nis bisedën</button>
  </form>;
}
