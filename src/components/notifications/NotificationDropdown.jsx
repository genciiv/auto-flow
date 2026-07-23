"use client";

import { Bell, CheckCheck, Inbox } from "lucide-react";

import NotificationItem from "@/components/notifications/NotificationItem";

export default function NotificationDropdown({
  notifications = [],
  unreadCount = 0,
  isPending = false,
  feedback = "",
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) {
  return (
    <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />

            <h2 className="font-bold text-slate-950">Njoftimet</h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {unreadCount > 0
              ? `${unreadCount} të palexuara`
              : "Nuk ke njoftime të palexuara"}
          </p>
        </div>

        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
          >
            <CheckCheck size={15} />
            Lexo të gjitha
          </button>
        ) : null}
      </div>

      {feedback ? (
        <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs font-semibold text-red-700">
          {feedback}
        </div>
      ) : null}

      {notifications.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Inbox size={25} />
          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-900">
            Nuk ka njoftime
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Njoftimet e reja do të shfaqen këtu.
          </p>
        </div>
      ) : (
        <div className="max-h-[28rem] overflow-y-auto">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              disabled={isPending}
              onClose={onClose}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
