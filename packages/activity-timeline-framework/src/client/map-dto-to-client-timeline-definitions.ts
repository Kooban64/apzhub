import type { TimelineDescriptorDto } from "../server/filter/map-timeline-registry-dto";
import {
  freezeClientTimelineDefinition,
  type ClientTimelineDefinition,
} from "./client-timeline-definition";

export function mapTimelineDescriptorDtoToClientDefinition(
  descriptor: TimelineDescriptorDto,
): ClientTimelineDefinition {
  return freezeClientTimelineDefinition({
    timelineId: descriptor.timelineId,
    scope: descriptor.scope,
    label: descriptor.label,
    grouping: descriptor.grouping,
    sortOrder: descriptor.sortOrder,
    activityTypeFilter: descriptor.activityTypeFilter,
    activityCategoryFilter: descriptor.activityCategoryFilter,
    version: descriptor.version,
    status: descriptor.status,
    experienceRef: descriptor.experienceRef,
    iconRef: descriptor.iconRef,
    source: descriptor.source,
    permissionKeys: descriptor.permissionKeys,
    visibility: descriptor.visibility,
    stability: descriptor.stability,
    description: descriptor.description,
  });
}

export function mapTimelineRegistryDtoToClientDefinitions(
  timelines: readonly TimelineDescriptorDto[],
): readonly ClientTimelineDefinition[] {
  return Object.freeze(
    [...timelines]
      .map(mapTimelineDescriptorDtoToClientDefinition)
      .sort((left, right) => left.timelineId.localeCompare(right.timelineId)),
  );
}
