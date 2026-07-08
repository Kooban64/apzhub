"use client";

import { useActivityService } from "@apzhub/activity-timeline-framework/react";
import { useNotificationService } from "@apzhub/event-notification-framework/react";
import { useMemo } from "react";

import { formatRelativeTimestamp } from "../../lib/ux/relative-time";
import { LawInformationCard } from "./cards/law-cards";

export interface LawActivityFeedProps {
  readonly title?: string;
  readonly limit?: number;
  readonly testId?: string;
}

export interface LawNotificationFeedProps {
  readonly title?: string;
  readonly limit?: number;
  readonly testId?: string;
}

/** Activity timeline excerpt — shell panel holds the full feed (LAW-013-08). */
export function LawActivityFeed({
  title = "Recent activity",
  limit = 6,
  testId = "law-activity-feed",
}: LawActivityFeedProps) {
  const { listActivities, isReady } = useActivityService();
  const activities = useMemo(
    () => listActivities().slice(0, limit),
    [listActivities, limit],
  );

  return (
    <LawInformationCard title={title}>
      <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
        {isReady
          ? "Latest firm activity from the Activity Framework."
          : "Loading activity…"}
      </p>
      {activities.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No activities recorded yet.
        </p>
      ) : (
        <ul
          className="divide-y divide-[var(--color-border)]"
          data-testid={testId}
          role="list"
        >
          {activities.map((activity) => (
            <li key={activity.activityId} className="py-2 text-sm">
              <span className="font-medium text-[var(--color-foreground)]">
                {activity.title}
              </span>
              <span className="mt-0.5 block text-xs text-[var(--color-muted-foreground)]">
                {activity.description || activity.activityTypeId}
                {` · ${formatRelativeTimestamp(activity.timestamp)}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </LawInformationCard>
  );
}

/** Notification excerpt — unread count surfaced in shell badge (LAW-013-08). */
export function LawNotificationFeed({
  title = "Recent notifications",
  limit = 5,
  testId = "law-notification-feed",
}: LawNotificationFeedProps) {
  const { notifications, unreadCount } = useNotificationService();
  const recent = useMemo(() => notifications.slice(0, limit), [notifications, limit]);

  return (
    <LawInformationCard title={title}>
      <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
        {unreadCount > 0
          ? `${unreadCount} unread in the notification panel.`
          : "All caught up."}
      </p>
      {recent.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No notifications yet.
        </p>
      ) : (
        <ul
          className="divide-y divide-[var(--color-border)]"
          data-testid={testId}
          role="list"
        >
          {recent.map((notification) => (
            <li key={notification.notificationId} className="py-2 text-sm">
              <span className="font-medium text-[var(--color-foreground)]">
                {notification.title}
              </span>
              <span className="mt-0.5 block text-xs text-[var(--color-muted-foreground)]">
                {notification.body}
                {` · ${formatRelativeTimestamp(notification.timestamp)}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </LawInformationCard>
  );
}
