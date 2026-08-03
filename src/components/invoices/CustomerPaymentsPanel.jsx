"use client";
import { useState } from "react";
import { recordCustomerPaymentAction } from "@/actions/invoice-payment-actions";

export default function CustomerPaymentsPanel({ invoice, canRecordPayment }) {
  const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  const paid=(invoice.customerPayments||[]).reduce((s,p)=>s+Number(p.amount||0),0);
  const remaining=Math.max(Number(invoice.total||0)-paid,0);
  async function submit(formData){setBusy(true);const r=await recordCustomerPaymentAction(formData);setMessage(r.message);setBusy(false);if(r.success) window.location.reload();}
  return <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-950">Pagesat e klientit</h2><p className="mt-1 text-sm text-slate-500">Pagesa të plota ose të pjesshme për këtë faturë.</p></div><div className="text-right"><p className="text-xs text-slate-500">Detyrimi i mbetur</p><p className="text-xl font-bold text-red-600">{remaining.toLocaleString("sq-AL")} Lek</p></div></div>
    {canRecordPayment && remaining>0 ? <form action={submit} className="mt-5 grid gap-3 md:grid-cols-4"><input type="hidden" name="invoiceId" value={invoice.id}/><input name="amount" type="number" min="1" max={remaining} required placeholder="Shuma" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/><select name="method" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="CASH">Cash</option><option value="CARD">Kartë</option><option value="BANK_TRANSFER">Transfertë</option><option value="OTHER">Tjetër</option></select><input name="reference" placeholder="Referenca (opsionale)" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/><button disabled={busy} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">Regjistro pagesën</button></form> : null}
    <div className="mt-5 divide-y divide-slate-100">{invoice.customerPayments?.length ? invoice.customerPayments.map(p=><div key={p.id} className="flex justify-between gap-4 py-3 text-sm"><div><p className="font-semibold text-slate-900">{p.method} · {p.recordedBy?.name||"Stafi"}</p><p className="text-xs text-slate-500">{new Date(p.paidAt).toLocaleString("sq-AL")}{p.reference?` · ${p.reference}`:""}</p></div><strong className="text-emerald-700">{Number(p.amount).toLocaleString("sq-AL")} Lek</strong></div>) : <p className="py-4 text-sm text-slate-500">Nuk ka ende pagesa.</p>}</div>
    {message?<p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm">{message}</p>:null}
  </section>;
}
