"use client";

import { Button } from "@apzhub/ui";

import type { ActivityTimelineListProps } from "./types";

function severityClassName(severity: string): string {
  switch (severity) {
    case "critical":
      return "border-l-[var(--color-destructive)]";
    case "warning":
      return "border-l-amber-500";
    default:
      return "border-l-[var(--color-accent)]";
  }
}

/**
 * Renders presentation-layer groups without regrouping or transforming items.
 */
export function ActivityTimelineList({
  groups,
  onSelectAction,
}: ActivityTimelineListProps) {
  return (
    <ul data-testid="activity-timeline-list">
      {groups.map((group) => (
        <li key={group.key} data-testid={`activity-timeline-group-${group.key}`}>
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {group.label}
          </p>
          <ul>
            {group.items.map((item) => (
              <li
                key={item.activityId}
                data-testid={`activity-timeline-item-${item.activityId}`}
                className={`border-b border-[var(--color-border)] border-l-4 px-3 py-3 ${severityClassName(item.severity)}`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-foreground)]">
                    {item.title}
                  </p>
                  {item.description ? (
                    <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                      {item.description}
                    </p>
                  ) : null}
                  <p
                    className="mt-1 text-[10px] text-[var(--color-muted-foreground)]"
                    title={item.timestamp}
                  >
                    {item.relativeTimestamp}
                  </p>
                </div>
                {item.actionRef ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => onSelectAction?.(item)}
                    data-testid={`activity-timeline-action-${item.activityId}`}
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
  );
}
