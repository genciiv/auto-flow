"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, ReceiptText, Trash2 } from "lucide-react";

import { addLaborItemAction, removeLaborItemAction } from "@/actions/service-operation-actions";
import { addPartToService } from "@/actions/service-part-actions";
import { createInvoiceFromServiceAction } from "@/actions/invoice-payment-actions";

function money(value) {
  return `${Number(value || 0).toLocaleString("sq-AL")} Lek`;
}

export default function ServiceOperationsPanel({ service, parts, canManageParts, canCreateInvoice }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run(action) {
    setBusy(true); setMessage("");
    const result = await action();
    setMessage(result?.message || "");
    setBusy(false);
    if (result?.success) router.refresh();
    if (result?.invoiceId) router.push(`/dashboard/invoices/${result.invoiceId}`);
  }

  async function addLabor(formData) { await run(() => addLaborItemAction(formData)); }
  async function addPart(formData) { await run(() => addPartToService(formData)); }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-bold text-slate-950">Punët e kryera</h2><p className="text-sm text-slate-500">Regjistro orët, shërbimin dhe çmimin e punës.</p></div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{service.laborItems.length} rreshta</span>
        </div>
        <form action={addLabor} className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_120px_150px_auto]">
          <input type="hidden" name="serviceId" value={service.id}/>
          <input name="description" required placeholder="P.sh. Ndërrim vaji" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/>
          <input name="quantity" type="number" min="0.1" step="0.1" defaultValue="1" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/>
          <input name="unitPrice" type="number" min="0" step="1" required placeholder="Çmimi" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/>
          <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"><Plus size={16}/> Shto</button>
        </form>
        <div className="mt-5 divide-y divide-slate-100">
          {service.laborItems.length === 0 ? <p className="py-5 text-sm text-slate-500">Nuk ka ende punë të regjistruara.</p> : service.laborItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-4">
              <div><p className="font-semibold text-slate-900">{item.description}</p><p className="text-xs text-slate-500">{item.quantity} × {money(item.unitPrice)} · {item.createdBy?.name || "Stafi"}</p></div>
              <div className="flex items-center gap-3"><strong>{money(item.total)}</strong><button type="button" disabled={busy} onClick={() => run(() => removeLaborItemAction(item.id))} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16}/></button></div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Pjesët e përdorura</h2><p className="text-sm text-slate-500">Çdo pjesë e regjistruar ul stokun dhe ruan lëvizjen në inventar.</p>
        {canManageParts ? <form action={addPart} className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_120px_auto]">
          <input type="hidden" name="serviceId" value={service.id}/>
          <select name="partId" required className="rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="">Zgjidh pjesën...</option>{parts.map((part) => <option key={part.id} value={part.id}>{part.name} · stok {part.stock} · {money(part.sellPrice)}</option>)}</select>
          <input name="quantity" type="number" min="1" step="1" defaultValue="1" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/>
          <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"><Plus size={16}/> Regjistro</button>
        </form> : null}
        <div className="mt-5 divide-y divide-slate-100">{service.partsUsed.length === 0 ? <p className="py-5 text-sm text-slate-500">Nuk ka pjesë të përdorura.</p> : service.partsUsed.map((usage) => <div key={usage.id} className="flex justify-between gap-4 py-4"><div><p className="font-semibold text-slate-900">{usage.part.name}</p><p className="text-xs text-slate-500">{usage.quantity} × {money(usage.unitPrice)}</p></div><strong>{money(usage.total)}</strong></div>)}</div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold text-slate-950">Faturimi</h2><p className="text-sm text-slate-500">Totali i urdhër-punës: <strong>{money(service.total)}</strong></p></div>
          {service.invoice ? <button type="button" onClick={() => router.push(`/dashboard/invoices/${service.invoice.id}`)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"><ReceiptText size={17}/> Hape {service.invoice.number}</button> : canCreateInvoice ? <button type="button" disabled={busy} onClick={() => run(() => createInvoiceFromServiceAction(service.id))} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"><ReceiptText size={17}/> Krijo faturën</button> : <span className="text-sm text-slate-500">Fatura krijohet nga recepsioni, financieri ose menaxheri.</span>}
        </div>
      </section>
      {message ? <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{busy ? <Loader2 className="mr-2 inline animate-spin" size={15}/> : null}{message}</p> : null}
    </div>
  );
}
