import type { ActivityPresentationDiagnostics } from "../presentation";
import type { ActivityTimelineServiceDiagnostics } from "../client/service/activity-timeline-service-diagnostics";

export type ActivityTimelineExperienceSurface =
  "activity-timeline" | "activity-timeline-panel" | "workbench-activity-timeline";

export interface ActivityTimelineEmptyStateContent {
  readonly title: string;
  readonly description?: string;
}

export interface ActivityTimelineExperienceDiagnostics {
  readonly surface: ActivityTimelineExperienceSurface;
  readonly totalCount: number;
  readonly renderedItemCount: number;
  readonly renderedGroupCount: number;
  readonly isEmpty: boolean;
  readonly isLoading: boolean;
  readonly presentation: ActivityPresentationDiagnostics;
  readonly service: ActivityTimelineServiceDiagnostics;
}

export interface ActivityTimelineListProps {
  readonly groups: readonly import("../presentation").ActivityViewModelGroup[];
  readonly onSelectAction?: (
    model: import("../presentation").ActivityViewModel,
  ) => void;
}

export interface ActivityTimelineExperienceProps {
  readonly surface?: ActivityTimelineExperienceSurface;
  readonly timelineScope?: import("../types/timeline-scope").TimelineScopeId;
  readonly limit?: number;
  readonly now?: Date | string;
  readonly locale?: string;
  readonly emptyState?: ActivityTimelineEmptyStateContent;
  readonly onActionExecuted?: (actionId: string) => void;
}

export interface ActivityTimelinePanelExperienceProps extends ActivityTimelineExperienceProps {
  readonly open?: boolean;
}

export interface WorkbenchActivityTimelineProps extends ActivityTimelineExperienceProps {
  readonly variant?: "inline" | "panel";
  readonly panelOpen?: boolean;
}
