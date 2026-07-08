import { ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION } from "../server/filter/activity-registry-dto-schema-version";
import type {
  ActivityRegistryDto,
  ActivityTypeDescriptorDto,
} from "../server/filter/map-activity-registry-dto";
import { TIMELINE_REGISTRY_DTO_SCHEMA_VERSION } from "../server/filter/timeline-registry-dto-schema-version";
import type {
  TimelineDescriptorDto,
  TimelineRegistryDto,
} from "../server/filter/map-timeline-registry-dto";
import { TIMELINE_SCOPE_PERSONAL, TIMELINE_SCOPE_TEAM } from "../types/timeline-scope";
import { type ActivityTimelineHydrationBundle } from "./activity-timeline-hydration-bundle";
import { ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION } from "./activity-timeline-hydration-bundle-schema-version";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

function activityTypeDto(
  overrides: Partial<ActivityTypeDescriptorDto> &
    Pick<ActivityTypeDescriptorDto, "activityTypeId">,
): ActivityTypeDescriptorDto {
  return {
    sourceEventPattern: "capability.example.created",
    category: "capability",
    timelineScopes: [TIMELINE_SCOPE_PERSONAL],
    templateRef: "example-created",
    version: "1.0.0",
    schemaVersion: "1.0.0",
    visibility: "public",
    stability: "stable",
    status: "active",
    source: "manifest",
    tags: [],
    ...overrides,
  };
}

export function sampleActivityRegistryDto(
  overrides: Partial<ActivityRegistryDto> = {},
): ActivityRegistryDto {
  return {
    schemaVersion: ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: "1.0.0",
    types: [
      activityTypeDto({
        activityTypeId: "platform.action.executed",
        sourceEventPattern: "capability.action.executed",
        source: "builtin",
        label: "Action executed",
      }),
      activityTypeDto({
        activityTypeId: "capability.example.created",
        permissionKeys: ["example.write"],
        label: "Example created",
      }),
    ],
    ...overrides,
  };
}

function timelineDto(
  overrides: Partial<TimelineDescriptorDto> & Pick<TimelineDescriptorDto, "timelineId">,
): TimelineDescriptorDto {
  return {
    scope: TIMELINE_SCOPE_PERSONAL,
    label: "Example timeline",
    grouping: "flat",
    version: "1.0.0",
    status: "active",
    source: "manifest",
    visibility: "public",
    stability: "stable",
    ...overrides,
  };
}

export function sampleTimelineRegistryDto(
  overrides: Partial<TimelineRegistryDto> = {},
): TimelineRegistryDto {
  return {
    schemaVersion: TIMELINE_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: "1.0.0",
    timelines: [
      timelineDto({
        timelineId: TIMELINE_SCOPE_PERSONAL,
        source: "builtin",
        label: "Personal timeline",
      }),
      timelineDto({
        timelineId: "team.support",
        scope: TIMELINE_SCOPE_TEAM,
        permissionKeys: ["platform.team.support.read"],
        label: "Team support",
      }),
    ],
    ...overrides,
  };
}

export function sampleActivityTimelineHydrationBundle(
  overrides: Partial<ActivityTimelineHydrationBundle> = {},
): ActivityTimelineHydrationBundle {
  return {
    schemaVersion: ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION,
    frameworkVersion: "1.0.0",
    activityRegistry: sampleActivityRegistryDto(),
    timelineRegistry: sampleTimelineRegistryDto(),
    synchronisation: CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
    ...overrides,
  };
}
