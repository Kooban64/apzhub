import type { ActivityPresentationDiagnostics } from "../presentation";
import type { ActivityTimelineServiceDiagnostics } from "../client/service/activity-timeline-service-diagnostics";
import type {
  ActivityTimelineExperienceDiagnostics,
  ActivityTimelineExperienceSurface,
} from "./types";

export interface BuildActivityTimelineExperienceDiagnosticsInput {
  readonly surface: ActivityTimelineExperienceSurface;
  readonly totalCount: number;
  readonly renderedItemCount: number;
  readonly renderedGroupCount: number;
  readonly isEmpty: boolean;
  readonly isLoading: boolean;
  readonly presentation: ActivityPresentationDiagnostics;
  readonly service: ActivityTimelineServiceDiagnostics;
}

export function buildActivityTimelineExperienceDiagnostics(
  input: BuildActivityTimelineExperienceDiagnosticsInput,
): ActivityTimelineExperienceDiagnostics {
  return Object.freeze({
    surface: input.surface,
    totalCount: input.totalCount,
    renderedItemCount: input.renderedItemCount,
    renderedGroupCount: input.renderedGroupCount,
    isEmpty: input.isEmpty,
    isLoading: input.isLoading,
    presentation: input.presentation,
    service: input.service,
  });
}
