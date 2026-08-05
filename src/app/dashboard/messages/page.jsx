import { MessageCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ConversationList from "@/components/chat/ConversationList";
import NewConversationForm from "@/components/chat/NewConversationForm";
import { createBusinessConversationAction } from "@/actions/chat-actions";
import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata = { title: "Mesazhet | AutoFlow" };
export default async function BusinessMessagesPage() {
  const { businessId } = await requireBusinessPermission(PERMISSIONS.MESSAGES_VIEW);
  const [conversations, links, services] = await Promise.all([
    db.conversation.findMany({ where: { businessId, status: "ACTIVE" }, include: { customerProfile: { include: { user: { select: { name: true } } } }, vehicle: { select: { id:true, plate:true, brand:true, model:true } }, service: { select: { id:true, title:true } }, messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body:true, senderType:true, createdAt:true } } }, orderBy: { lastMessageAt: "desc" } }),
    db.customerVehicleLink.findMany({ where: { isActive: true, vehicle: { businessId } }, include: { customerVehicle: { include: { profile: { include: { user: { select: { name:true } } } } } }, vehicle: { select: { id:true, plate:true, brand:true, model:true } } }, orderBy: { linkedAt: "desc" } }),
    db.serviceRecord.findMany({ where: { businessId, vehicle: { customerLinks: { some: { isActive: true } } } }, select: { id:true, title:true, vehicle: { select: { plate:true, brand:true, model:true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  const rows = conversations.map(c => ({ ...c, displayName: c.customerProfile.user.name || "Klient AutoFlow", unread: c.messages[0]?.senderType === "CUSTOMER" && (!c.businessLastReadAt || new Date(c.lastMessageAt) > new Date(c.businessLastReadAt)) }));
  const contacts = links.map(link => ({ key: link.id, customerProfileId: link.customerVehicle.profile.id, customerName: link.customerVehicle.profile.user.name || "Klient", vehicleId: link.vehicle.id, vehicleLabel: `${link.vehicle.brand} ${link.vehicle.model || ""} · ${link.vehicle.plate}` }));
  return <DashboardLayout><div className="space-y-7"><section className="rounded-[2rem] bg-slate-950 px-7 py-8 text-white"><div className="flex items-center gap-3"><MessageCircle className="text-blue-300"/><div><p className="text-sm font-semibold text-blue-300">Komunikimi</p><h1 className="mt-1 text-3xl font-black">Mesazhet me klientët</h1><p className="mt-2 text-sm text-slate-300">Biseda të sigurta vetëm me klientët dhe automjetet e lidhura.</p></div></div></section><div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]"><ConversationList conversations={rows} basePath="/dashboard/messages" emptyText="Nis bisedën e parë me një klient të lidhur."/><NewConversationForm contacts={contacts} services={services.map(service => ({ ...service, vehicleLabel: `${service.vehicle.brand} ${service.vehicle.model || ""} · ${service.vehicle.plate}` }))} action={createBusinessConversationAction} mode="business"/></div></div></DashboardLayout>;
}
