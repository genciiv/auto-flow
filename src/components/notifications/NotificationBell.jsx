import { auth } from "@/auth";
import NotificationBellClient from "@/components/notifications/NotificationBellClient";
import { getUserNotificationSummary } from "@/services/notification-service";

export default async function NotificationBell() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const { notifications, unreadCount } = await getUserNotificationSummary(
    userId,
    {
      limit: 12,
    },
  );

  return (
    <NotificationBellClient
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    />
  );
}
