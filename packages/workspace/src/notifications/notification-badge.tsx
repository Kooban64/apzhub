"use client";

import { Button } from "@apzhub/ui";

import type { NotificationBadgeProps } from "./types";

export function NotificationBadge({
  unreadCount,
  pressed = false,
  onPress,
  ariaLabel,
}: NotificationBadgeProps) {
  const label =
    ariaLabel ??
    (unreadCount > 0
      ? `Notifications, ${unreadCount} unread`
      : "Notifications, none unread");

  return (
    <Button
      type="button"
      variant={pressed ? "default" : "outline"}
      size="sm"
      onClick={onPress}
      aria-label={label}
      aria-pressed={pressed}
      data-testid="notification-badge"
      data-unread-count={unreadCount}
    >
      <span aria-hidden>Notifications</span>
      {unreadCount > 0 ? (
        <span
          className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-[10px] font-semibold text-[var(--color-accent-foreground)]"
          data-testid="notification-badge-count"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Button>
  );
}
