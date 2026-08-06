import Link from "next/link";
import { Car, MessageCircle, Wrench } from "lucide-react";

import { formatAppDateTime } from "@/lib/date-time";

export default function ConversationList({ conversations, basePath, emptyText }) {
  if (!conversations.length) {
    return <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><MessageCircle className="mx-auto text-slate-400" size={34}/><p className="mt-4 font-bold text-slate-900">Nuk ka ende biseda</p><p className="mt-2 text-sm text-slate-500">{emptyText}</p></div>;
  }
  return <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
    {conversations.map((conversation) => {
      const lastMessage = conversation.messages?.[0];
      return <Link key={conversation.id} href={`${basePath}/${conversation.id}`} className="flex gap-4 p-5 transition hover:bg-slate-50">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><MessageCircle size={20}/></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3"><p className="truncate font-bold text-slate-950">{conversation.displayName}</p><span className="shrink-0 text-xs text-slate-400">{formatAppDateTime(conversation.lastMessageAt)}</span></div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><Car size={13}/>{conversation.vehicle.brand} {conversation.vehicle.model || ""} · {conversation.vehicle.plate}</span>{conversation.service ? <span className="inline-flex items-center gap-1"><Wrench size={13}/>{conversation.service.title}</span> : null}</div>
          <div className="mt-2 flex items-center justify-between gap-3"><p className="truncate text-sm text-slate-600">{lastMessage?.body || conversation.subject || "Bisedë e re"}</p>{conversation.unread ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" title="Mesazh i palexuar"/> : null}</div>
        </div>
      </Link>;
    })}
  </div>;
}
