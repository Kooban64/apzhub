"use client";

import { useCallback } from "react";

import { useCommandRegistry } from "@apzhub/command-framework/react";

import type { ActivityViewModel } from "../presentation";
import { ActivityTimelineList } from "./activity-timeline-list";
import { buildActivityTimelineExperienceDiagnostics } from "./build-activity-timeline-experience-diagnostics";
import { delegateActivityActionRef } from "./delegate-activity-action";
import { TimelineEmptyState } from "./timeline-empty-state";
import { TimelineLoadingState } from "./timeline-loading-state";
import type { ActivityTimelineEmptyStateContent } from "./types";
import type { UseActivityTimelineExperienceDiagnosticsResult } from "./use-activity-timeline-experience-diagnostics";

function ActivityTimelineExperienceDiagnosticsMarker({
  diagnostics,
}: {
  readonly diagnostics: ReturnType<typeof buildActivityTimelineExperienceDiagnostics>;
}) {
  return (
    <span
      hidden
      data-testid="activity-timeline-experience-diagnostics"
      data-surface={diagnostics.surface}
      data-total-count={diagnostics.totalCount}
      data-rendered-item-count={diagnostics.renderedItemCount}
      data-rendered-group-count={diagnostics.renderedGroupCount}
      data-empty={diagnostics.isEmpty ? "true" : "false"}
      data-loading={diagnostics.isLoading ? "true" : "false"}
    />
  );
}

export interface ActivityTimelineExperienceViewProps {
  readonly state: UseActivityTimelineExperienceDiagnosticsResult;
  readonly emptyState?: ActivityTimelineEmptyStateContent;
  readonly onActionExecuted?: (actionId: string) => void;
  readonly testId?: string;
}

/** Presentation-only view — renders grouped view models without regrouping. */
export function ActivityTimelineExperienceView({
  state,
  emptyState,
  onActionExecuted,
  testId = "activity-timeline-experience",
}: ActivityTimelineExperienceViewProps) {
  const { execute } = useCommandRegistry();

  const handleSelectAction = useCallback(
    async (model: ActivityViewModel) => {
      const ok = await delegateActivityActionRef(model.actionRef, { execute });
      if (ok && model.actionRef) {
        onActionExecuted?.(model.actionRef.actionId);
      }
    },
    [execute, onActionExecuted],
  );

  return (
    <>
      <ActivityTimelineExperienceDiagnosticsMarker
        diagnostics={state.experienceDiagnostics}
      />
      <div data-testid={testId}>
        {state.isLoading ? (
          <TimelineLoadingState />
        ) : state.isEmpty ? (
          <TimelineEmptyState emptyState={emptyState} />
        ) : (
          <ActivityTimelineList
            groups={state.groupedViewModels}
            onSelectAction={handleSelectAction}
          />
        )}
      </div>
    </>
  );
}
