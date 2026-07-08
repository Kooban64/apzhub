import type { ActivityCategory } from "../types/activity-category";
import type { TimelineDefinition } from "../types/timeline-definition";

function freezeCategoryArray(
  values: readonly ActivityCategory[] | undefined,
): readonly ActivityCategory[] {
  return Object.freeze([...(values ?? [])]);
}

export function freezeTimelineDefinition(
  definition: TimelineDefinition,
): TimelineDefinition {
  const frozenMetadata =
    definition.metadata === undefined
      ? undefined
      : Object.freeze({ ...definition.metadata });

  return Object.freeze({
    ...definition,
    supportedActivityCategories: freezeCategoryArray(
      definition.supportedActivityCategories,
    ),
    metadata: frozenMetadata,
  });
}

export function freezeTimelineDefinitions(
  definitions: readonly TimelineDefinition[],
): readonly TimelineDefinition[] {
  return Object.freeze(
    definitions.map((definition) => freezeTimelineDefinition(definition)),
  );
}
