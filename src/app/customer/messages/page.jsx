import { MessageCircle } from "lucide-react";
import ConversationList from "@/components/chat/ConversationList";
import NewConversationForm from "@/components/chat/NewConversationForm";
import { createCustomerConversationAction } from "@/actions/chat-actions";
import { requireCustomerContext } from "@/lib/customer-context";
import { db } from "@/lib/db";
import {
  activeCustomerVehicleLinkWhere,
  customerConversationAccessWhere,
  customerServiceAccessWhere,
} from "@/lib/customer-access";

export const metadata = { title: "Mesazhet | AutoFlow" };
export default async function CustomerMessagesPage() {
  const { profileId } = await requireCustomerContext();
  const [conversations, links, services] = await Promise.all([
    db.conversation.findMany({ where: { ...customerConversationAccessWhere(profileId), status:"ACTIVE" }, include: { business:{ select:{ id:true,name:true } }, vehicle:{ select:{ id:true,plate:true,brand:true,model:true } }, service:{ select:{ id:true,title:true } }, messages:{ orderBy:{ createdAt:"desc" }, take:1, select:{ body:true,senderType:true,createdAt:true } } }, orderBy:{ lastMessageAt:"desc" } }),
    db.customerVehicleLink.findMany({ where: activeCustomerVehicleLinkWhere(profileId), include:{ vehicle:{ include:{ business:{ select:{ id:true,name:true } } } } }, orderBy:{ linkedAt:"desc" } }),
    db.serviceRecord.findMany({ where: customerServiceAccessWhere(profileId), select: { id:true, title:true, vehicle: { select: { plate:true, brand:true, model:true } } }, orderBy: { createdAt:"desc" }, take:100 }),
  ]);
  const rows=conversations.map(c=>({ ...c, displayName:c.business.name, unread:c.messages[0]?.senderType === "BUSINESS" && (!c.customerLastReadAt || new Date(c.lastMessageAt)>new Date(c.customerLastReadAt)) }));
  const contacts=links.map(link=>({ key:link.id, businessName:link.vehicle.business.name, vehicleId:link.vehicle.id, vehicleLabel:`${link.vehicle.brand} ${link.vehicle.model || ""} · ${link.vehicle.plate}` }));
  return <div className="space-y-7"><section className="rounded-[2rem] bg-slate-950 px-7 py-8 text-white"><div className="flex items-center gap-3"><MessageCircle className="text-blue-300"/><div><p className="text-sm font-semibold text-blue-300">Komunikimi</p><h1 className="mt-1 text-3xl font-black">Mesazhet me servisin</h1><p className="mt-2 text-sm text-slate-300">Komuniko vetëm me serviset ku automjeti yt është lidhur dhe aprovuar.</p></div></div></section><div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]"><ConversationList conversations={rows} basePath="/customer/messages" emptyText="Nis bisedën e parë me një servis të lidhur."/><NewConversationForm contacts={contacts} services={services.map(service => ({ ...service, vehicleLabel: `${service.vehicle.brand} ${service.vehicle.model || ""} · ${service.vehicle.plate}` }))} action={createCustomerConversationAction} mode="customer"/></div></div>;
}
