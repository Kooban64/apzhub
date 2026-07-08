"use client";

import { useMemo } from "react";

import type { ActivityCategory } from "../types/activity-category";
import type { TimelineScopeId } from "../types/timeline-scope";
import {
  presentActivities,
  type ActivityGroupingStrategy,
  type ActivityPresentationDiagnostics,
  type ActivityViewModel,
  type ActivityViewModelGroup,
  type MapActivityDocumentToViewModelOptions,
} from "../presentation";
import { useOptionalActivityTimelineContext } from "./activity-timeline-context";
import { useActivityService } from "./use-activity-service";

export interface UseActivityPresentationOptions extends MapActivityDocumentToViewModelOptions {
  readonly timelineScope?: TimelineScopeId;
  readonly category?: ActivityCategory;
  readonly activityTypeId?: string;
  readonly limit?: number;
  readonly grouping?: ActivityGroupingStrategy;
  readonly includeEmptyGroups?: boolean;
}

export interface UseActivityPresentationResult {
  readonly viewModels: readonly ActivityViewModel[];
  readonly groupedViewModels: readonly ActivityViewModelGroup[];
  readonly isEmpty: boolean;
  readonly isReady: boolean;
  readonly diagnostics: ActivityPresentationDiagnostics;
  readonly serviceDiagnostics: ReturnType<typeof useActivityService>["diagnostics"];
}

/**
 * Maps Activity Timeline Service documents into UI-ready view models.
 * Read-only — does not mutate service state, query registries inline, or render UI.
 */
export function useActivityPresentation(
  options: UseActivityPresentationOptions = {},
): UseActivityPresentationResult {
  const { listActivities, diagnostics: serviceDiagnostics } = useActivityService();
  const hydrationContext = useOptionalActivityTimelineContext();
  const {
    timelineScope,
    category,
    activityTypeId,
    limit,
    grouping,
    includeEmptyGroups,
    now,
    locale,
  } = options;

  const documents = useMemo(
    () =>
      listActivities({
        timelineScope,
        category,
        activityTypeId,
        limit,
      }),
    [listActivities, timelineScope, category, activityTypeId, limit],
  );

  const iconRefByActivityTypeId = useMemo(() => {
    if (!hydrationContext?.ok) {
      return undefined;
    }

    const entries = hydrationContext.activityRegistry
      .list()
      .flatMap((type) =>
        type.iconRef ? [[type.activityTypeId, type.iconRef] as const] : [],
      );

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }, [hydrationContext]);

  const presentation = useMemo(
    () =>
      presentActivities(documents, {
        now,
        locale,
        grouping,
        includeEmptyGroups,
        iconRefByActivityTypeId,
      }),
    [documents, now, locale, grouping, includeEmptyGroups, iconRefByActivityTypeId],
  );

  return useMemo(
    () => ({
      viewModels: presentation.viewModels,
      groupedViewModels: presentation.groupedViewModels,
      isEmpty: presentation.viewModels.length === 0,
      isReady: serviceDiagnostics.serviceStatus !== "unavailable",
      diagnostics: presentation.diagnostics,
      serviceDiagnostics,
    }),
    [presentation, serviceDiagnostics],
  );
}
