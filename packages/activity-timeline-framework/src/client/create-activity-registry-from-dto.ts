import type { ActivityRegistrationIssue } from "../types/activity-metadata";
import type { ActivityRegistryDto } from "../server/filter/map-activity-registry-dto";
import { createEmptyActivityRegistryDto } from "../server/filter/map-activity-registry-dto";
import { validateActivityRegistryDto } from "../server/filter/validate-activity-registry-dto";
import {
  ClientActivityRegistry,
  createEmptyClientActivityRegistry,
  createInvalidClientActivityRegistry,
} from "./client-activity-registry";
import type { ClientActivityRegistryDiagnostics } from "./client-activity-registry-diagnostics";
import { mapActivityRegistryDtoToClientTypes } from "./map-dto-to-client-activity-types";
import type { ReadOnlyActivityRegistry } from "./read-only-activity-registry";
import type { ClientRegistrySynchronisationState } from "./synchronisation";

export interface CreateActivityRegistryFromDtoOptions {
  /** When false, skips descriptor validation (tests only). Default true. */
  readonly validate?: boolean;
  readonly hydratedAt?: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}

export interface CreateActivityRegistryFromDtoResult {
  readonly ok: boolean;
  readonly registry: ReadOnlyActivityRegistry;
  readonly dto: ActivityRegistryDto;
  readonly diagnostics: ClientActivityRegistryDiagnostics;
  readonly errors: readonly ActivityRegistrationIssue[];
}

/**
 * Hydrate a read-only client registry from a server-generated ActivityRegistryDto.
 *
 * The server remains authoritative — this function never registers activity types.
 */
export function createActivityRegistryFromDto(
  dto: unknown,
  options: CreateActivityRegistryFromDtoOptions = {},
): CreateActivityRegistryFromDtoResult {
  const validate = options.validate ?? true;
  const hydratedAt = options.hydratedAt ?? new Date().toISOString();

  if (!validate) {
    const payload = dto as ActivityRegistryDto;
    const types = mapActivityRegistryDtoToClientTypes(payload.types ?? []);
    const registry = new ClientActivityRegistry({
      types,
      schemaVersion: payload.schemaVersion,
      frameworkVersion: payload.frameworkVersion,
      status: types.length > 0 ? "hydrated" : "empty",
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

  const validation = validateActivityRegistryDto(dto);
  if (!validation.ok) {
    const registry = createInvalidClientActivityRegistry();
    return {
      ok: false,
      registry,
      dto: validation.dto,
      diagnostics: registry.getDiagnostics(),
      errors: validation.errors,
    };
  }

  if (validation.dto.types.length === 0) {
    const registry = createEmptyClientActivityRegistry();
    return {
      ok: true,
      registry,
      dto: validation.dto,
      diagnostics: registry.getDiagnostics(),
      errors: [],
    };
  }

  const types = mapActivityRegistryDtoToClientTypes(validation.dto.types);
  const registry = new ClientActivityRegistry({
    types,
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

export { createEmptyActivityRegistryDto };
