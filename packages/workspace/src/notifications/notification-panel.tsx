"use client";

import { Button } from "@apzhub/ui";

import type { NotificationPanelProps } from "./types";

const DEFAULT_EMPTY_STATE = Object.freeze({
  title: "No notifications",
  description: "You are all caught up.",
});

function severityClassName(severity: string): string {
  switch (severity) {
    case "critical":
      return "border-l-[var(--color-destructive)]";
    case "warning":
      return "border-l-amber-500";
    case "subtle":
      return "border-l-[var(--color-muted-foreground)]";
    default:
      return "border-l-[var(--color-accent)]";
  }
}

export function NotificationPanel({
  open,
  groups,
  viewModels,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectAction,
  emptyState = DEFAULT_EMPTY_STATE,
}: NotificationPanelProps) {
  if (!open) {
    return null;
  }

  const hasNotifications = viewModels.length > 0;
  const unreadCount = viewModels.filter((model) => model.isUnread).length;

  return (
    <section
      role="region"
      aria-label="Notifications"
      data-testid="notification-panel"
      className="absolute right-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
    >
      <header className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
          Notifications
        </h2>
        {hasNotifications && unreadCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            data-testid="notification-mark-all-read"
          >
            Mark all read
          </Button>
        ) : null}
      </header>

      {!hasNotifications ? (
        <div
          className="px-4 py-8 text-center"
          role="status"
          data-testid="notification-panel-empty"
        >
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            {emptyState.title}
          </p>
          {emptyState.description ? (
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              {emptyState.description}
            </p>
          ) : null}
        </div>
      ) : (
        <ul className="max-h-96 overflow-y-auto">
          {groups.map((group) => (
            <li key={group.key}>
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                {group.label}
              </p>
              <ul>
                {group.items.map((item) => (
                  <li
                    key={item.notificationId}
                    data-testid={`notification-item-${item.notificationId}`}
                    data-read-state={item.readState}
                    className={`border-b border-[var(--color-border)] border-l-4 px-3 py-3 ${severityClassName(item.severity)} ${
                      item.isUnread ? "bg-[var(--color-muted)]/40" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--color-foreground)]">
                          {item.title}
                        </p>
                        {item.body ? (
                          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                            {item.body}
                          </p>
                        ) : null}
                        <p className="mt-1 text-[10px] text-[var(--color-muted-foreground)]">
                          {item.relativeTimestamp}
                        </p>
                      </div>
                      {item.isUnread ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkAsRead(item.notificationId)}
                          data-testid={`notification-mark-read-${item.notificationId}`}
                        >
                          Mark read
                        </Button>
                      ) : null}
                    </div>
                    {item.actionRef ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => onSelectAction?.(item)}
                        data-testid={`notification-action-${item.notificationId}`}
                      >
                        Open action
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
