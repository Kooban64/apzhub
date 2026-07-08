import type { ActivityTypeDescriptorDto } from "../server/filter/map-activity-registry-dto";
import {
  freezeClientActivityType,
  type ClientActivityType,
} from "./client-activity-type";

export function mapActivityTypeDescriptorDtoToClientType(
  descriptor: ActivityTypeDescriptorDto,
): ClientActivityType {
  return freezeClientActivityType({
    activityTypeId: descriptor.activityTypeId,
    sourceEventPattern: descriptor.sourceEventPattern,
    category: descriptor.category,
    timelineScopes: descriptor.timelineScopes,
    templateRef: descriptor.templateRef,
    version: descriptor.version,
    schemaVersion: descriptor.schemaVersion,
    severity: descriptor.severity,
    iconRef: descriptor.iconRef,
    permissionKeys: descriptor.permissionKeys,
    visibility: descriptor.visibility,
    stability: descriptor.stability,
    status: descriptor.status,
    source: descriptor.source,
    label: descriptor.label,
    description: descriptor.description,
    tags: descriptor.tags,
  });
}

export function mapActivityRegistryDtoToClientTypes(
  types: readonly ActivityTypeDescriptorDto[],
): readonly ClientActivityType[] {
  return Object.freeze(
    [...types]
      .map(mapActivityTypeDescriptorDtoToClientType)
      .sort((left, right) => left.activityTypeId.localeCompare(right.activityTypeId)),
  );
}
