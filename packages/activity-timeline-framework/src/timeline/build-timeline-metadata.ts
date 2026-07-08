import type { TimelineDefinition } from "../types/timeline-definition";
import type {
  TimelineEntryDiagnostics,
  TimelineMetadata,
} from "../types/timeline-metadata";

export function buildTimelineMetadata(
  definition: TimelineDefinition,
): TimelineMetadata {
  const supportedActivityCategories = Object.freeze([
    ...(definition.supportedActivityCategories ?? []),
  ]);

  const diagnostics: TimelineEntryDiagnostics = Object.freeze({
    validationIssueCount: 0,
    supportedCategoryCount: supportedActivityCategories.length,
    message:
      definition.status === "planned"
        ? "Timeline registered as planned — experience deferred until active"
        : definition.status === "inactive"
          ? "Timeline inactive — excluded from presentation"
          : undefined,
  });

  return Object.freeze({
    timelineId: definition.timelineId,
    scope: definition.scope,
    label: definition.label,
    version: definition.version,
    visibility: definition.visibility ?? "public",
    stability: definition.stability ?? "stable",
    status: definition.status ?? "active",
    source: definition.source ?? "manifest",
    order: definition.order,
    description: definition.description,
    icon: definition.icon,
    supportedActivityCategories,
    diagnostics,
  });
}

export function buildTimelineMetadataList(
  definitions: readonly TimelineDefinition[],
): readonly TimelineMetadata[] {
  return Object.freeze(
    definitions.map((definition) => buildTimelineMetadata(definition)),
  );
}
