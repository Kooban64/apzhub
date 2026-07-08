import {
  collectDuplicateEventIssues,
  collectEventValidationIssues,
} from "../event/event-batch-helpers";
import type { EventDescriptor } from "../event/event-descriptor";
import type { EventRegistrationIssue } from "../event/event-metadata";
import { EVENT_REGISTRY_DTO_SCHEMA_VERSION } from "./event-registry-dto-schema-version";
import {
  createEmptyEventRegistryDto,
  type EventDescriptorDto,
  type EventRegistryDto,
} from "./map-event-registry-dto";

export interface EventRegistryDtoValidationResult {
  readonly ok: boolean;
  readonly dto: EventRegistryDto;
  readonly errors: readonly EventRegistrationIssue[];
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

function mapDtoEntryToDescriptor(entry: EventDescriptorDto): EventDescriptor {
  return {
    eventId: entry.eventId,
    version: entry.version,
    category: entry.category,
    publisher: entry.sourceCapability,
    sourceCapability: entry.sourceCapability,
    schemaVersion: entry.schemaVersion,
    visibility: entry.visibility,
    stability: entry.stability,
    description: entry.description,
    tags: entry.tags,
    status: entry.status,
    label: entry.label,
    permission: entry.permission,
    subscribers: entry.subscribers,
    source: entry.source,
  };
}

/**
 * Validate an unknown server payload before client hydration.
 * Returns structured errors instead of throwing for invalid DTO shapes.
 */
export function validateEventRegistryDto(
  dto: unknown,
): EventRegistryDtoValidationResult {
  const errors: EventRegistrationIssue[] = [];

  if (!isRecord(dto)) {
    return {
      ok: false,
      dto: createEmptyEventRegistryDto(),
      errors: Object.freeze([
        {
          code: "VALIDATION",
          message: "EventRegistryDto must be an object",
        },
      ]),
    };
  }

  if (dto.schemaVersion !== EVENT_REGISTRY_DTO_SCHEMA_VERSION) {
    errors.push({
      code: "VALIDATION",
      message: `EventRegistryDto.schemaVersion must be ${EVENT_REGISTRY_DTO_SCHEMA_VERSION}`,
      field: "schemaVersion",
    });
  }

  if (!Array.isArray(dto.events)) {
    errors.push({
      code: "VALIDATION",
      message: "EventRegistryDto.events must be an array",
      field: "events",
    });
    return {
      ok: false,
      dto: createEmptyEventRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  if (errors.length > 0) {
    return {
      ok: false,
      dto: createEmptyEventRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  const events = dto.events as EventDescriptorDto[];
  const descriptors = events.map(mapDtoEntryToDescriptor);
  const validationIssues = collectEventValidationIssues(descriptors);
  if (validationIssues.length > 0) {
    return {
      ok: false,
      dto: createEmptyEventRegistryDto(),
      errors: Object.freeze([...validationIssues]),
    };
  }

  const duplicateIssues = collectDuplicateEventIssues(descriptors, new Set());
  if (duplicateIssues.length > 0) {
    return {
      ok: false,
      dto: createEmptyEventRegistryDto(),
      errors: Object.freeze([...duplicateIssues]),
    };
  }

  const frameworkVersion = normaliseFrameworkVersion(dto.frameworkVersion);
  if (dto.frameworkVersion !== undefined && frameworkVersion === undefined) {
    errors.push({
      code: "VALIDATION",
      message: "EventRegistryDto.frameworkVersion must be a non-empty string",
      field: "frameworkVersion",
    });
    return {
      ok: false,
      dto: createEmptyEventRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  return {
    ok: true,
    dto: Object.freeze({
      schemaVersion: EVENT_REGISTRY_DTO_SCHEMA_VERSION,
      frameworkVersion,
      events: Object.freeze([...events]),
    }),
    errors: [],
  };
}
