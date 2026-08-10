"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { markAdminNotificationReadAction, markAllAdminNotificationsReadAction } from "@/app/admin/actions/notifications";

export function MarkAllAdminNotificationsReadButton({ disabled = false }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={disabled || pending} onClick={() => startTransition(async () => { await markAllAdminNotificationsReadAction(); router.refresh(); })} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><CheckCheck size={16} />{pending ? "Duke ruajtur..." : "Shëno të gjitha të lexuara"}</button>;
}

export function AdminNotificationLink({ notification, children, className = "" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} onClick={() => startTransition(async () => { if (!notification.isRead) await markAdminNotificationReadAction(notification.sourceId); router.push(notification.href); router.refresh(); })} className={className}>{children}</button>;
}
