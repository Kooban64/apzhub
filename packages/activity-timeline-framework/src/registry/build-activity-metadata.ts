import type { ActivityDescriptor } from "../types/activity-descriptor";
import type {
  ActivityEntryDiagnostics,
  ActivityMetadata,
} from "../types/activity-metadata";

export function buildActivityMetadata(
  descriptor: ActivityDescriptor,
): ActivityMetadata {
  const tags = Object.freeze([...(descriptor.tags ?? [])]);
  const timelineScopes = Object.freeze([...descriptor.timelineScopes]);

  const diagnostics: ActivityEntryDiagnostics = Object.freeze({
    validationIssueCount: 0,
    timelineScopeCount: timelineScopes.length,
    message:
      descriptor.status === "planned"
        ? "Activity type registered as planned — mapping deferred until active"
        : descriptor.status === "disabled"
          ? "Activity type disabled — excluded from mapper matching"
          : undefined,
  });

  return Object.freeze({
    activityTypeId: descriptor.activityTypeId,
    version: descriptor.version,
    category: descriptor.category,
    sourceEventPattern: descriptor.sourceEventPattern,
    timelineScopes,
    templateRef: descriptor.templateRef,
    sourceCapability: descriptor.sourceCapability,
    schemaVersion: descriptor.schemaVersion ?? descriptor.version,
    visibility: descriptor.visibility ?? "public",
    stability: descriptor.stability ?? "stable",
    status: descriptor.status ?? "active",
    source: descriptor.source ?? "manifest",
    label: descriptor.label,
    description: descriptor.description,
    tags,
    diagnostics,
  });
}

export function buildActivityMetadataList(
  descriptors: readonly ActivityDescriptor[],
): readonly ActivityMetadata[] {
  return Object.freeze(
    descriptors.map((descriptor) => buildActivityMetadata(descriptor)),
  );
}
