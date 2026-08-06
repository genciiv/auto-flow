import { MessageCircle, MessageSquareText, UsersRound } from "lucide-react";

import { createBusinessConversationAction } from "@/actions/chat-actions";
import ConversationList from "@/components/chat/ConversationList";
import NewConversationForm from "@/components/chat/NewConversationForm";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata = { title: "Mesazhet | AutoFlow" };

export default async function BusinessMessagesPage() {
  const { businessId } = await requireBusinessPermission(
    PERMISSIONS.MESSAGES_VIEW,
  );

  const [conversations, links, services] = await Promise.all([
    db.conversation.findMany({
      where: { businessId, status: "ACTIVE" },
      include: {
        customerProfile: {
          include: { user: { select: { name: true } } },
        },
        vehicle: {
          select: { id: true, plate: true, brand: true, model: true },
        },
        service: { select: { id: true, title: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { body: true, senderType: true, createdAt: true },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    }),
    db.customerVehicleLink.findMany({
      where: { isActive: true, vehicle: { businessId } },
      include: {
        customerVehicle: {
          include: {
            profile: {
              include: { user: { select: { name: true } } },
            },
          },
        },
        vehicle: {
          select: { id: true, plate: true, brand: true, model: true },
        },
      },
      orderBy: { linkedAt: "desc" },
    }),
    db.serviceRecord.findMany({
      where: {
        businessId,
        vehicle: { customerLinks: { some: { isActive: true } } },
      },
      select: {
        id: true,
        title: true,
        vehicle: {
          select: { plate: true, brand: true, model: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const rows = conversations.map((conversation) => ({
    ...conversation,
    displayName:
      conversation.customerProfile.user.name || "Klient AutoFlow",
    unread:
      conversation.messages[0]?.senderType === "CUSTOMER" &&
      (!conversation.businessLastReadAt ||
        new Date(conversation.lastMessageAt) >
          new Date(conversation.businessLastReadAt)),
  }));

  const contacts = links.map((link) => ({
    key: link.id,
    customerProfileId: link.customerVehicle.profile.id,
    customerName: link.customerVehicle.profile.user.name || "Klient",
    vehicleId: link.vehicle.id,
    vehicleLabel: `${link.vehicle.brand} ${link.vehicle.model || ""} · ${link.vehicle.plate}`,
  }));

  const unreadCount = rows.filter((conversation) => conversation.unread).length;

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                <MessageCircle size={14} />
                Komunikimi me klientët
              </div>
              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Mesazhet
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Menaxho bisedat e sigurta për klientët, automjetet dhe shërbimet e lidhura.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <MessageSquareText size={16} />
                  <span className="text-xs font-semibold">Biseda aktive</span>
                </div>
                <p className="mt-2 text-2xl font-black">{rows.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <UsersRound size={16} />
                  <span className="text-xs font-semibold">Të palexuara</span>
                </div>
                <p className="mt-2 text-2xl font-black">{unreadCount}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]">
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Bisedat aktive</h2>
              <p className="mt-1 text-sm text-slate-500">
                Bisedat më të fundit shfaqen të parat.
              </p>
            </div>
            <ConversationList
              conversations={rows}
              basePath="/dashboard/messages"
              emptyText="Nis bisedën e parë me një klient të lidhur."
            />
          </section>

          <NewConversationForm
            contacts={contacts}
            services={services.map((service) => ({
              ...service,
              vehicleLabel: `${service.vehicle.brand} ${service.vehicle.model || ""} · ${service.vehicle.plate}`,
            }))}
            action={createBusinessConversationAction}
            mode="business"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
