"use client";

import type { ActivityTimelineEmptyStateContent } from "./types";

const DEFAULT_EMPTY_STATE: ActivityTimelineEmptyStateContent = Object.freeze({
  title: "No recent activity",
  description: "Activity will appear here as actions occur.",
});

export interface TimelineEmptyStateProps {
  readonly emptyState?: ActivityTimelineEmptyStateContent;
}

export function TimelineEmptyState({
  emptyState = DEFAULT_EMPTY_STATE,
}: TimelineEmptyStateProps) {
  return (
    <div
      className="px-4 py-8 text-center"
      role="status"
      data-testid="activity-timeline-empty"
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
  );
}
