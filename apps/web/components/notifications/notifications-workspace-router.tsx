"use client";

import { usePathname } from "next/navigation";

import { resolveNotificationsSection } from "@/lib/notifications/routes";

import { PlatformNotificationsView } from "./platform-notifications-view";

export function NotificationsWorkspaceRouter() {
  const pathname = usePathname();
  const section = resolveNotificationsSection(pathname);
  return <PlatformNotificationsView section={section} />;
}
