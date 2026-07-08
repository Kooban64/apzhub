import type { TimelineRegistrationIssue } from "../types/timeline-metadata";
import type { TimelineRegistryDto } from "../server/filter/map-timeline-registry-dto";
import { createEmptyTimelineRegistryDto } from "../server/filter/map-timeline-registry-dto";
import { validateTimelineRegistryDto } from "../server/filter/validate-timeline-registry-dto";
import {
  ClientTimelineRegistry,
  createEmptyClientTimelineRegistry,
  createInvalidClientTimelineRegistry,
} from "./client-timeline-registry";
import type { ClientTimelineRegistryDiagnostics } from "./client-timeline-registry-diagnostics";
import { mapTimelineRegistryDtoToClientDefinitions } from "./map-dto-to-client-timeline-definitions";
import type { ReadOnlyTimelineRegistry } from "./read-only-timeline-registry";
import type { ClientRegistrySynchronisationState } from "./synchronisation";

export interface CreateTimelineRegistryFromDtoOptions {
  /** When false, skips descriptor validation (tests only). Default true. */
  readonly validate?: boolean;
  readonly hydratedAt?: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}

export interface CreateTimelineRegistryFromDtoResult {
  readonly ok: boolean;
  readonly registry: ReadOnlyTimelineRegistry;
  readonly dto: TimelineRegistryDto;
  readonly diagnostics: ClientTimelineRegistryDiagnostics;
  readonly errors: readonly TimelineRegistrationIssue[];
}

/**
 * Hydrate a read-only client registry from a server-generated TimelineRegistryDto.
 *
 * The server remains authoritative — this function never registers timelines.
 */
export function createTimelineRegistryFromDto(
  dto: unknown,
  options: CreateTimelineRegistryFromDtoOptions = {},
): CreateTimelineRegistryFromDtoResult {
  const validate = options.validate ?? true;
  const hydratedAt = options.hydratedAt ?? new Date().toISOString();

  if (!validate) {
    const payload = dto as TimelineRegistryDto;
    const timelines = mapTimelineRegistryDtoToClientDefinitions(
      payload.timelines ?? [],
    );
    const registry = new ClientTimelineRegistry({
      timelines,
      schemaVersion: payload.schemaVersion,
      frameworkVersion: payload.frameworkVersion,
      status: timelines.length > 0 ? "hydrated" : "empty",
      hydratedAt,
      synchronisation: options.synchronisation,
    });

    return {
      ok: true,
      registry,
      dto: payload,
      diagnostics: registry.getDiagnostics(),
      errors: [],
    };
  }

  const validation = validateTimelineRegistryDto(dto);
  if (!validation.ok) {
    const registry = createInvalidClientTimelineRegistry();
    return {
      ok: false,
      registry,
      dto: validation.dto,
      diagnostics: registry.getDiagnostics(),
      errors: validation.errors,
    };
  }

  if (validation.dto.timelines.length === 0) {
    const registry = createEmptyClientTimelineRegistry();
    return {
      ok: true,
      registry,
      dto: validation.dto,
      diagnostics: registry.getDiagnostics(),
      errors: [],
    };
  }

  const timelines = mapTimelineRegistryDtoToClientDefinitions(validation.dto.timelines);
  const registry = new ClientTimelineRegistry({
    timelines,
    schemaVersion: validation.dto.schemaVersion,
    frameworkVersion: validation.dto.frameworkVersion,
    status: "hydrated",
    hydratedAt,
    synchronisation: options.synchronisation,
  });

  return {
    ok: true,
    registry,
    dto: validation.dto,
    diagnostics: registry.getDiagnostics(),
    errors: [],
  };
}

export { createEmptyTimelineRegistryDto };
