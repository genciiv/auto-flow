"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CarFront,
  ChevronRight,
  Inbox,
  MessageSquareText,
} from "lucide-react";

import useNotificationRefresh from "@/hooks/useNotificationRefresh";

function getTypeLabel(type) {
  const labels = {
    VEHICLE: "Makinë",
    MOTORCYCLE: "Motor",
    PART: "Pjesë",
    ACCESSORY: "Aksesor",
    SERVICE: "Shërbim",
    OTHER: "Publikim",
  };

  return labels[type] || "Publikim";
}

function getRelativeTime(value) {
  if (!value) return "";

  const createdAt = new Date(value);

  if (Number.isNaN(createdAt.getTime())) return "";

  const differenceInSeconds = Math.max(
    0,
    Math.floor((Date.now() - createdAt.getTime()) / 1000),
  );

  if (differenceInSeconds < 60) return "Tani";

  const minutes = Math.floor(differenceInSeconds / 60);

  if (minutes < 60) return `${minutes} min më parë`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} orë më parë`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days} ditë më parë`;

  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "short",
  }).format(createdAt);
}

function truncateText(value, maxLength = 82) {
  const text = String(value || "").trim();

  if (!text) return "Pa mesazh";
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength).trim()}...`;
}

function NotificationIcon({ notification }) {
  if (notification.kind === "VEHICLE_CLAIM") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600">
        <CarFront size={20} />
      </div>
    );
  }

  if (notification.image) {
    return (
      <Image
        src={notification.image}
        alt={notification.subtitle || "Publikim Marketplace"}
        fill
        sizes="48px"
        className="object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center text-blue-600">
      <MessageSquareText size={19} />
    </div>
  );
}

export default function NotificationDropdown({
  unreadCount = 0,
  notifications = [],
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useNotificationRefresh();

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

  const visibleUnreadCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Hap njoftimet"
        aria-expanded={open}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <Bell size={18} />

        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {visibleUnreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-[410px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="font-bold text-slate-950">Njoftimet</p>

              <p className="mt-1 text-xs text-slate-500">
                Marketplace dhe kërkesat për automjete
              </p>
            </div>

            {unreadCount > 0 ? (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                {unreadCount} {unreadCount === 1 ? "njoftim" : "njoftime"}
              </span>
            ) : null}
          </div>

          {notifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Inbox size={23} />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-950">
                Nuk ka njoftime
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Kërkesat e reja do të shfaqen këtu.
              </p>
            </div>
          ) : (
            <div className="max-h-[440px] overflow-y-auto p-2">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => setOpen(false)}
                  className={`group flex gap-3 rounded-2xl p-3 transition ${
                    notification.isRead
                      ? "hover:bg-slate-50"
                      : "bg-blue-50/70 hover:bg-blue-50"
                  }`}
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <NotificationIcon notification={notification} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={`truncate text-sm text-slate-950 ${
                          notification.isRead ? "font-semibold" : "font-bold"
                        }`}
                      >
                        {notification.title}
                      </p>

                      {!notification.isRead ? (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      ) : null}
                    </div>

                    <p className="mt-0.5 truncate text-xs font-semibold text-blue-600">
                      {notification.subtitle}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {truncateText(notification.message)}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-medium text-slate-400">
                        {notification.kind === "VEHICLE_CLAIM"
                          ? "Lidhje automjeti"
                          : getTypeLabel(notification.listingType)}
                        {" · "}
                        {getRelativeTime(notification.createdAt)}
                      </span>

                      <ChevronRight
                        size={15}
                        className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/70 p-3">
            <Link
              href="/dashboard/vehicle-claims"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-blue-600 hover:text-white hover:ring-blue-600"
            >
              Lidhjet
              <ChevronRight size={15} />
            </Link>

            <Link
              href="/dashboard/marketplace/inquiries"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-blue-600 hover:text-white hover:ring-blue-600"
            >
              Marketplace
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
