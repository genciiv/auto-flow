"use client";

import { Bell, CheckCheck, Inbox } from "lucide-react";

import NotificationItem from "@/components/notifications/NotificationItem";

export default function NotificationDropdown({
  notifications = [],
  unreadCount = 0,
  isPending = false,
  feedback = "",
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) {
  return (
    <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[390px] max-w-[calc(100vw-24px)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-blue-600" />

              <h2 className="text-base font-bold text-slate-900">Njoftimet</h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {unreadCount > 0
                ? `${unreadCount} njoftime të palexuara`
                : "Të gjitha njoftimet janë lexuar"}
            </p>
          </div>

          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={15} />
              Lexo të gjitha
            </button>
          ) : null}
        </div>
      </div>

      {feedback ? (
        <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs font-semibold text-red-700">
          {feedback}
        </div>
      ) : null}

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Inbox size={28} />
          </div>

          <h3 className="mt-5 text-sm font-bold text-slate-900">
            Nuk ke njoftime
          </h3>

          <p className="mt-2 max-w-[240px] text-xs leading-5 text-slate-500">
            Kur të ndodhë një aktivitet i ri në sistem, njoftimet do të shfaqen
            këtu.
          </p>
        </div>
      ) : (
        <div className="max-h-[520px] overflow-y-auto">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              disabled={isPending}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
