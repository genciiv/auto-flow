"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { markAdminNotificationReadAction } from "@/app/admin/actions/notifications";

import {
  Bell,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  Inbox,
  ShieldAlert,
} from "lucide-react";

function getRelativeTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const differenceInSeconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000),
  );

  if (differenceInSeconds < 60) {
    return "Tani";
  }

  const minutes = Math.floor(differenceInSeconds / 60);

  if (minutes < 60) {
    return `${minutes} min më parë`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} orë më parë`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} ditë më parë`;
  }

  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "short",
  }).format(date);
}

function getNotificationIcon(kind) {
  const icons = {
    APPLICATION: FileText,
    PAYMENT_PENDING: CircleDollarSign,
    TRIAL_EXPIRING: Clock3,
    SUBSCRIPTION_EXPIRED: ShieldAlert,
  };

  return icons[kind] || Bell;
}

function getNotificationColors(kind) {
  const colors = {
    APPLICATION: "bg-blue-50 text-blue-600",
    PAYMENT_PENDING: "bg-amber-50 text-amber-600",
    TRIAL_EXPIRING: "bg-violet-50 text-violet-600",
    SUBSCRIPTION_EXPIRED: "bg-red-50 text-red-600",
  };

  return colors[kind] || "bg-slate-100 text-slate-600";
}

export default function AdminNotificationDropdown({
  unreadCount = 0,
  notifications = [],
  counts = {},
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [optimisticReadIds, setOptimisticReadIds] = useState(() => new Set());
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const effectiveUnreadCount = notifications.reduce(
    (total, notification) =>
      total +
      (notification.isRead || optimisticReadIds.has(notification.id) ? 0 : 1),
    0,
  );
  const visibleCount = effectiveUnreadCount > 99 ? "99+" : effectiveUnreadCount;

  function handleNotificationClick(notification) {
    setOpen(false);

    const wasUnread =
      !notification.isRead && !optimisticReadIds.has(notification.id);

    if (wasUnread) {
      setOptimisticReadIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.add(notification.id);
        return nextIds;
      });
    }

    startTransition(async () => {
      try {
        await markAdminNotificationReadAction(notification.id);
      } finally {
        router.push(notification.href);
        router.refresh();
      }
    });
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((currentValue) => !currentValue)}
        aria-label="Hap njoftimet e administratorit"
        aria-expanded={open}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <Bell size={18} />

        {effectiveUnreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {visibleCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-[calc(100vw-2rem)] max-w-[420px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-slate-950">Njoftimet e adminit</p>

                <p className="mt-1 text-xs text-slate-500">
                  Aplikime, pagesa dhe abonime
                </p>
              </div>

              {effectiveUnreadCount > 0 ? (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                  {effectiveUnreadCount}
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              <div className="rounded-xl bg-slate-50 px-2 py-2 text-center">
                <p className="text-sm font-bold text-slate-950">
                  {counts.applications || 0}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">Aplikime</p>
              </div>

              <div className="rounded-xl bg-slate-50 px-2 py-2 text-center">
                <p className="text-sm font-bold text-slate-950">
                  {counts.payments || 0}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">Pagesa</p>
              </div>

              <div className="rounded-xl bg-slate-50 px-2 py-2 text-center">
                <p className="text-sm font-bold text-slate-950">
                  {counts.expiringTrials || 0}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">Trial</p>
              </div>

              <div className="rounded-xl bg-slate-50 px-2 py-2 text-center">
                <p className="text-sm font-bold text-slate-950">
                  {counts.expiredSubscriptions || 0}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">Skaduar</p>
              </div>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Inbox size={23} />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-950">
                Nuk ka njoftime
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Nuk ka veprime që kërkojnë vëmendje.
              </p>
            </div>
          ) : (
            <div className="max-h-[440px] overflow-y-auto p-2">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.kind);

                return (
                  <button
                    key={notification.id}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleNotificationClick(notification)}
                    className="group flex w-full gap-3 rounded-2xl p-3 text-left transition hover:bg-slate-50 disabled:cursor-wait"
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getNotificationColors(
                        notification.kind,
                      )}`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-bold text-slate-950">
                          {notification.title}
                        </p>

                        {!notification.isRead && !optimisticReadIds.has(notification.id) ? (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                        ) : null}
                      </div>

                      <p className="mt-0.5 truncate text-xs font-semibold text-blue-600">
                        {notification.subtitle}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-[11px] font-medium text-slate-400">
                          {getRelativeTime(notification.createdAt)}
                        </span>

                        <ChevronRight
                          size={15}
                          className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/70 p-3">
            <Link
              href="/admin/applications"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-blue-600 hover:text-white hover:ring-blue-600"
            >
              Aplikimet
              <ChevronRight size={15} />
            </Link>

            <Link
              href="/admin/subscriptions"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-blue-600 hover:text-white hover:ring-blue-600"
            >
              Abonimet
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
