"use client";

import { usePathname } from "next/navigation";

import { resolveNotificationsSection } from "@/lib/notifications/routes";

import { NotificationInboxView } from "./notification-inbox-view";
import { PlatformNotificationsView } from "./platform-notifications-view";

export function NotificationsWorkspaceRouter() {
  const pathname = usePathname();
  const section = resolveNotificationsSection(pathname);
  if (section === "inbox") {
    return <NotificationInboxView />;
  }
  return <PlatformNotificationsView section={section} />;
}
