import Link from "next/link";
import { ArrowLeft, Car, MessageCircle, Wrench } from "lucide-react";

import { markBusinessConversationReadAction, sendBusinessMessageAction } from "@/actions/chat-actions";
import ChatThread from "@/components/chat/ChatThread";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { requireBusinessPermission } from "@/lib/business-context";
import { requireBusinessConversation } from "@/lib/chat-access";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

export default async function BusinessConversationPage({ params }) {
  const { id } = await params;
  const { businessId } = await requireBusinessPermission(
    PERMISSIONS.MESSAGES_VIEW,
  );
  const conversation = await requireBusinessConversation({
    conversationId: id,
    businessId,
  });
  const messages = await db.chatMessage.findMany({
    where: { conversationId: id },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
    take: 300,
  });
  const serializable = JSON.parse(JSON.stringify(messages));

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <Link
          href="/dashboard/messages"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Kthehu te mesazhet
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-50 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <MessageCircle size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                Bisedë me klientin
              </p>
              <h1 className="mt-2 truncate text-2xl font-black tracking-tight text-slate-950">
                {conversation.customerProfile.user.name || "Klient AutoFlow"}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                  <Car size={14} />
                  {conversation.vehicle.brand} {conversation.vehicle.model || ""} · {conversation.vehicle.plate}
                </span>
                {conversation.service ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">
                    <Wrench size={14} />
                    {conversation.service.title}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <ChatThread
          conversationId={id}
          messages={serializable}
          viewerType="BUSINESS"
          sendAction={sendBusinessMessageAction}
          markReadAction={markBusinessConversationReadAction}
        />
      </div>
    </DashboardLayout>
  );
}
