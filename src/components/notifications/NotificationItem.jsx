"use client";

import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  CircleAlert,
  Info,
  Trash2,
  TriangleAlert,
  UserRound,
} from "lucide-react";

function formatRelativeTime(value) {
  const date = new Date(value);
  const now = new Date();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const difference = now.getTime() - date.getTime();
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

function getIconClass(type) {
  if (type === "SUCCESS") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (type === "WARNING") {
    return "bg-amber-50 text-amber-600";
  }

  if (type === "ERROR") {
    return "bg-red-50 text-red-600";
  }

  return "bg-blue-50 text-blue-600";
}

function NotificationTypeIcon({ type }) {
  if (type === "SUCCESS") {
    return <CheckCircle2 size={11} />;
  }

  if (type === "WARNING") {
    return <TriangleAlert size={11} />;
  }

  if (type === "ERROR") {
    return <CircleAlert size={11} />;
  }

  return <Info size={11} />;
}

export default function NotificationItem({
  notification,
  disabled = false,
  onClose,
  onMarkAsRead,
  onDelete,
}) {
  function handleOpen() {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    onClose?.();
  }

  function handleDelete(event) {
    event.preventDefault();
    event.stopPropagation();

    onDelete(notification.id);
  }

  const content = (
    <div
      className={`group relative flex gap-3 border-b border-slate-100 px-4 py-4 transition last:border-b-0 ${
        notification.isRead
          ? "bg-white hover:bg-slate-50"
          : "bg-blue-50/50 hover:bg-blue-50"
      }`}
    >
      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <UserRound size={19} />
        </div>

        <span
          className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${getIconClass(
            notification.type,
          )}`}
        >
          <NotificationTypeIcon type={notification.type} />
        </span>
      </div>

      <div className="min-w-0 flex-1 pr-8">
        {notification.actorName ? (
          <p className="truncate text-xs font-bold text-slate-950">
            {notification.actorName}
          </p>
        ) : null}

        <p className="mt-0.5 text-sm font-bold leading-5 text-slate-900">
          {notification.title}
        </p>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
          {notification.message}
        </p>

        <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
          <Bell size={11} />

          <span>{formatRelativeTime(notification.createdAt)}</span>

          {!notification.isRead ? (
            <>
              <span>•</span>
              <span className="text-blue-600">E re</span>
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
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Trash2 size={15} />
      </button>

      {!notification.isRead ? (
        <span className="absolute bottom-4 right-4 h-2 w-2 rounded-full bg-blue-600" />
      ) : null}
    </div>
  );

  if (notification.href) {
    return (
      <Link href={notification.href} onClick={handleOpen} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="block w-full text-left"
    >
      {content}
    </button>
  );
}
