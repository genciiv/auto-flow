"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  deleteNotificationAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/app/actions/notifications";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

export default function NotificationBellClient({ initialNotifications = [] }) {
  const router = useRouter();
  const containerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(
    () => initialNotifications,
  );
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleMarkAsRead(notificationId) {
    const notification = notifications.find(
      (item) => item.id === notificationId,
    );

    if (!notification || notification.isRead) {
      return;
    }

    setFeedback("");

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId
          ? {
              ...item,
              isRead: true,
              readAt: new Date().toISOString(),
            }
          : item,
      ),
    );

    startTransition(async () => {
      const result = await markNotificationAsReadAction(notificationId);

      if (!result?.success) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notificationId
              ? {
                  ...item,
                  isRead: false,
                  readAt: null,
                }
              : item,
          ),
        );

        setFeedback(result?.message || "Njoftimi nuk mund të përditësohej.");

        return;
      }

      router.refresh();
    });
  }

  function handleMarkAllAsRead() {
    if (unreadCount === 0 || isPending) {
      return;
    }

    setFeedback("");

    const previousNotifications = notifications;

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        isRead: true,
        readAt: item.readAt || new Date().toISOString(),
      })),
    );

    startTransition(async () => {
      const result = await markAllNotificationsAsReadAction();

      if (!result?.success) {
        setNotifications(previousNotifications);

        setFeedback(
          result?.message || "Njoftimet nuk mund të përditësoheshin.",
        );

        return;
      }

      router.refresh();
    });
  }

  function handleDelete(notificationId) {
    const notification = notifications.find(
      (item) => item.id === notificationId,
    );

    if (!notification || isPending) {
      return;
    }

    setFeedback("");

    setNotifications((current) =>
      current.filter((item) => item.id !== notificationId),
    );

    startTransition(async () => {
      const result = await deleteNotificationAction(notificationId);

      if (!result?.success) {
        setNotifications((current) => {
          const restored = [...current, notification];

          return restored.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        });

        setFeedback(result?.message || "Njoftimi nuk mund të fshihej.");

        return;
      }

      router.refresh();
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Hap njoftimet"
        aria-expanded={isOpen}
        className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
          isOpen
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        }`}
      >
        <Bell size={19} />

        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-black leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          isPending={isPending}
          feedback={feedback}
          onClose={() => setIsOpen(false)}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
        />
      ) : null}
    </div>
  );
}
