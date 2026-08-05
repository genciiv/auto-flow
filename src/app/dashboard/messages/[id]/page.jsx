import Link from "next/link";
import { ArrowLeft, Car, Wrench } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ChatThread from "@/components/chat/ChatThread";
import { markBusinessConversationReadAction, sendBusinessMessageAction } from "@/actions/chat-actions";
import { requireBusinessPermission } from "@/lib/business-context";
import { requireBusinessConversation } from "@/lib/chat-access";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

export default async function BusinessConversationPage({ params }) {
  const { id } = await params; const { businessId } = await requireBusinessPermission(PERMISSIONS.MESSAGES_VIEW);
  const conversation = await requireBusinessConversation({ conversationId:id, businessId });
  const messages = await db.chatMessage.findMany({ where: { conversationId:id }, include: { sender: { select: { id:true, name:true } } }, orderBy: { createdAt:"asc" }, take:300 });
  const serializable = JSON.parse(JSON.stringify(messages));
  return <DashboardLayout><div className="space-y-5"><Link href="/dashboard/messages" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600"><ArrowLeft size={16}/>Kthehu te mesazhet</Link><div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h1 className="text-xl font-black text-slate-950">{conversation.customerProfile.user.name || "Klient AutoFlow"}</h1><div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500"><span className="inline-flex items-center gap-1"><Car size={15}/>{conversation.vehicle.brand} {conversation.vehicle.model || ""} · {conversation.vehicle.plate}</span>{conversation.service ? <span className="inline-flex items-center gap-1"><Wrench size={15}/>{conversation.service.title}</span> : null}</div></div><ChatThread conversationId={id} messages={serializable} viewerType="BUSINESS" sendAction={sendBusinessMessageAction} markReadAction={markBusinessConversationReadAction}/></div></DashboardLayout>;
}
