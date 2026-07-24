"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  CircleAlert,
  Info,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { getNotificationUrl } from "@/lib/notification-router";

function formatRelativeTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const difference = now.getTime() - date.getTime();

  if (difference < 0) {
    return "tani";
  }

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) {
    return "tani";
  }

  if (minutes < 60) {
    return `${minutes} min më parë`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} orë më parë`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "dje";
  }

  if (days < 7) {
    return `${days} ditë më parë`;
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date);
}

function getIconContainerClass(type) {
  switch (type) {
    case "SUCCESS":
      return "bg-emerald-50 text-emerald-600";

    case "WARNING":
      return "bg-amber-50 text-amber-600";

    case "ERROR":
      return "bg-red-50 text-red-600";

    default:
      return "bg-blue-50 text-blue-600";
  }
}

function NotificationTypeIcon({ type }) {
  switch (type) {
    case "SUCCESS":
      return <CheckCircle2 size={17} />;

    case "WARNING":
      return <TriangleAlert size={17} />;

    case "ERROR":
      return <CircleAlert size={17} />;

    default:
      return <Info size={17} />;
  }
}

export default function NotificationItem({
  notification,
  disabled = false,
  onClose,
  onMarkAsRead,
  onDelete,
}) {
  const router = useRouter();

  if (!notification?.id) {
    return null;
  }

  const notificationUrl = getNotificationUrl(notification);

  function handleOpen() {
    if (disabled) {
      return;
    }

    if (!notification.isRead) {
      onMarkAsRead?.(notification.id);
    }

    onClose?.();

    if (notificationUrl) {
      router.push(notificationUrl);
    }
  }

  function handleDelete(event) {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    onDelete?.(notification.id);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className={`group relative flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left outline-none transition last:border-b-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${
        notification.isRead
          ? "bg-white hover:bg-slate-50"
          : "bg-blue-50/50 hover:bg-blue-50"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${getIconContainerClass(
          notification.type,
        )}`}
      >
        <NotificationTypeIcon type={notification.type} />
      </div>

      <div className="min-w-0 flex-1 pr-9">
        <div className="flex items-start gap-2">
          <p
            className={`line-clamp-2 text-sm leading-5 ${
              notification.isRead
                ? "font-semibold text-slate-800"
                : "font-bold text-slate-950"
            }`}
          >
            {notification.title || "Njoftim"}
          </p>

          {!notification.isRead ? (
            <span
              aria-label="Njoftim i palexuar"
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600"
            />
          ) : null}
        </div>

        {notification.message ? (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {notification.message}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Bell size={11} />
            {formatRelativeTime(notification.createdAt)}
          </span>

          {!notification.isRead ? (
            <>
              <span aria-hidden="true">•</span>
              <span className="text-blue-600">E re</span>
            </>
          ) : null}

          {notificationUrl ? (
            <>
              <span aria-hidden="true">•</span>
              <span className="text-slate-500">Kliko për të hapur</span>
            </>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={disabled}
        aria-label="Fshi njoftimin"
        title="Fshi njoftimin"
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
