import type { ActivityDocument } from "../types/activity-document";
import type { ActivityCategory } from "../types/activity-category";
import type { TimelineScopeId } from "../types/timeline-scope";
import { ACTIVITY_PRESENTATION_LAYER_STATUS } from "./layer-status";
import {
  groupActivityViewModels,
  type ActivityGroupingStrategy,
  type ActivityViewModelGroup,
} from "./group-activity-view-models";
import { isActivityRelativeTimestampFormatted } from "./format-activity-relative-timestamp";
import { mapActivityDocumentToViewModel } from "./map-activity-document-to-view-model";
import { sortActivityViewModels } from "./sort-activity-view-models";
import type { ActivityViewModel } from "./activity-view-model";
import { freezeActivityViewModel } from "./activity-view-model";

export type ActivityPresentationDiagnosticsStatus = "empty" | "ready";
export type ActivityPresentationFormattingStatus = "ok" | "partial";

export interface ActivityPresentationDiagnostics {
  readonly status: ActivityPresentationDiagnosticsStatus;
  readonly layerStatus: typeof ACTIVITY_PRESENTATION_LAYER_STATUS;
  readonly totalCount: number;
  readonly groupCount: number;
  readonly groupCounts: Readonly<Partial<Record<string, number>>>;
  readonly categoryCounts: Readonly<Partial<Record<ActivityCategory, number>>>;
  readonly scopeCounts: Readonly<Partial<Record<TimelineScopeId, number>>>;
  readonly presentationDurationMs: number;
  readonly formattingStatus: ActivityPresentationFormattingStatus;
  readonly message: string;
}

export interface BuildActivityPresentationDiagnosticsOptions {
  readonly groups?: readonly ActivityViewModelGroup[];
  readonly presentationDurationMs?: number;
}

function countByField<T extends string>(
  models: readonly ActivityViewModel[],
  selector: (model: ActivityViewModel) => T,
): Readonly<Partial<Record<T, number>>> {
  const counts: Partial<Record<T, number>> = {};

  for (const model of models) {
    const key = selector(model);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return Object.freeze(counts);
}

function resolveFormattingStatus(
  models: readonly ActivityViewModel[],
): ActivityPresentationFormattingStatus {
  for (const model of models) {
    if (
      !isActivityRelativeTimestampFormatted(model.timestamp, model.relativeTimestamp)
    ) {
      return "partial";
    }
  }

  return "ok";
}

/** Presentation diagnostics from mapped view models — read-only metrics for Experiences/dev. */
export function buildActivityPresentationDiagnostics(
  models: readonly ActivityViewModel[],
  options: BuildActivityPresentationDiagnosticsOptions = {},
): ActivityPresentationDiagnostics {
  const totalCount = models.length;
  const groups = options.groups ?? groupActivityViewModels(models);
  const groupCounts: Partial<Record<string, number>> = {};

  for (const group of groups) {
    groupCounts[group.key] = group.items.length;
  }

  return Object.freeze({
    status: totalCount === 0 ? "empty" : "ready",
    layerStatus: ACTIVITY_PRESENTATION_LAYER_STATUS,
    totalCount,
    groupCount: groups.length,
    groupCounts: Object.freeze({ ...groupCounts }),
    categoryCounts: countByField(models, (model) => model.category),
    scopeCounts: countByField(models, (model) => model.timelineScope),
    presentationDurationMs: options.presentationDurationMs ?? 0,
    formattingStatus: resolveFormattingStatus(models),
    message:
      totalCount === 0
        ? "Activity presentation ready — no view models"
        : "Activity presentation ready — view models mapped",
  });
}

export interface PresentActivitiesOptions {
  readonly now?: Date | string;
  readonly locale?: string;
  readonly grouping?: ActivityGroupingStrategy;
  readonly includeEmptyGroups?: boolean;
  readonly iconRefByActivityTypeId?: Readonly<Partial<Record<string, string>>>;
}

export interface PresentActivitiesResult {
  readonly viewModels: readonly ActivityViewModel[];
  readonly groupedViewModels: readonly ActivityViewModelGroup[];
  readonly diagnostics: ActivityPresentationDiagnostics;
}

function mapDocumentsWithIcons(
  documents: readonly ActivityDocument[],
  options: PresentActivitiesOptions,
): readonly ActivityViewModel[] {
  return Object.freeze(
    documents.map((document) => {
      const iconRef = options.iconRefByActivityTypeId?.[document.activityTypeId];
      const model = mapActivityDocumentToViewModel(document, {
        now: options.now,
        locale: options.locale,
        iconRef,
      });

      return iconRef ? freezeActivityViewModel({ ...model, icon: iconRef }) : model;
    }),
  );
}

/**
 * End-to-end presentation helper — map, sort, group, diagnose.
 * Does not query services, mutate data, store state, or render UI.
 */
export function presentActivities(
  documents: readonly ActivityDocument[],
  options: PresentActivitiesOptions = {},
): PresentActivitiesResult {
  const started = performance.now();

  const viewModels = sortActivityViewModels(mapDocumentsWithIcons(documents, options));
  const groupedViewModels = groupActivityViewModels(viewModels, {
    strategy: options.grouping,
    includeEmptyGroups: options.includeEmptyGroups,
    now: options.now,
  });
  const presentationDurationMs = performance.now() - started;
  const diagnostics = buildActivityPresentationDiagnostics(viewModels, {
    groups: groupedViewModels,
    presentationDurationMs,
  });

  return Object.freeze({
    viewModels,
    groupedViewModels,
    diagnostics,
  });
}
