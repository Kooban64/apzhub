import {
  collectDuplicateRouteIssues,
  collectNotificationValidationIssues,
} from "../notification/notification-batch-helpers";
import type { NotificationDescriptor } from "../notification/notification-descriptor";
import type { NotificationRegistrationIssue } from "../notification/notification-metadata";
import { NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION } from "./notification-registry-dto-schema-version";
import {
  createEmptyNotificationRegistryDto,
  type NotificationRouteDescriptorDto,
  type NotificationRegistryDto,
} from "./map-notification-registry-dto";

export interface NotificationRegistryDtoValidationResult {
  readonly ok: boolean;
  readonly dto: NotificationRegistryDto;
  readonly errors: readonly NotificationRegistrationIssue[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normaliseFrameworkVersion(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function mapDtoEntryToDescriptor(
  entry: NotificationRouteDescriptorDto,
): NotificationDescriptor {
  return {
    routeId: entry.routeId,
    eventPattern: entry.eventPattern,
    notificationKind: entry.notificationKind,
    channel: entry.channel,
    templateRef: entry.templateRef,
    version: entry.version,
    schemaVersion: entry.schemaVersion,
    visibility: entry.visibility,
    stability: entry.stability,
    description: entry.description,
    tags: entry.tags,
    status: entry.status,
    label: entry.label,
    permission: entry.permission,
    priority: entry.priority,
    sourceCapability: entry.sourceCapability,
    source: entry.source,
  };
}

/**
 * Validate an unknown server payload before client hydration.
 * Returns structured errors instead of throwing for invalid DTO shapes.
 */
export function validateNotificationRegistryDto(
  dto: unknown,
): NotificationRegistryDtoValidationResult {
  const errors: NotificationRegistrationIssue[] = [];

  if (!isRecord(dto)) {
    return {
      ok: false,
      dto: createEmptyNotificationRegistryDto(),
      errors: Object.freeze([
        {
          code: "VALIDATION",
          message: "NotificationRegistryDto must be an object",
        },
      ]),
    };
  }

  if (dto.schemaVersion !== NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION) {
    errors.push({
      code: "VALIDATION",
      message: `NotificationRegistryDto.schemaVersion must be ${NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION}`,
      field: "schemaVersion",
    });
  }

  if (!Array.isArray(dto.routes)) {
    errors.push({
      code: "VALIDATION",
      message: "NotificationRegistryDto.routes must be an array",
      field: "routes",
    });
    return {
      ok: false,
      dto: createEmptyNotificationRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  if (errors.length > 0) {
    return {
      ok: false,
      dto: createEmptyNotificationRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  const routes = dto.routes as NotificationRouteDescriptorDto[];
  const descriptors = routes.map(mapDtoEntryToDescriptor);
  const validationIssues = collectNotificationValidationIssues(descriptors);
  if (validationIssues.length > 0) {
    return {
      ok: false,
      dto: createEmptyNotificationRegistryDto(),
      errors: Object.freeze([...validationIssues]),
    };
  }

  const duplicateIssues = collectDuplicateRouteIssues(descriptors, new Set());
  if (duplicateIssues.length > 0) {
    return {
      ok: false,
      dto: createEmptyNotificationRegistryDto(),
      errors: Object.freeze([...duplicateIssues]),
    };
  }

  const frameworkVersion = normaliseFrameworkVersion(dto.frameworkVersion);
  if (dto.frameworkVersion !== undefined && frameworkVersion === undefined) {
    errors.push({
      code: "VALIDATION",
      message: "NotificationRegistryDto.frameworkVersion must be a non-empty string",
      field: "frameworkVersion",
    });
    return {
      ok: false,
      dto: createEmptyNotificationRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  return {
    ok: true,
    dto: Object.freeze({
      schemaVersion: NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION,
      frameworkVersion,
      routes: Object.freeze([...routes]),
    }),
    errors: [],
  };
}
