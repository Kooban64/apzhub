import type { NotificationRegistrationIssue } from "../notification/notification-metadata";
import type { NotificationRegistryDto } from "../server/map-notification-registry-dto";
import { createEmptyNotificationRegistryDto } from "../server/map-notification-registry-dto";
import {
  ClientNotificationRegistry,
  createEmptyClientNotificationRegistry,
  createInvalidClientNotificationRegistry,
} from "./client-notification-registry";
import type { ClientNotificationRegistryDiagnostics } from "./client-notification-registry-diagnostics";
import { mapNotificationRegistryDtoToRoutes } from "./map-dto-to-notification-routes";
import type { ReadOnlyNotificationRegistry } from "./read-only-notification-registry";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { validateNotificationRegistryDto } from "./validate-notification-registry-dto";

export interface CreateNotificationRegistryFromDtoOptions {
  /** When false, skips descriptor validation (tests only). Default true. */
  readonly validate?: boolean;
  readonly hydratedAt?: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}

export interface CreateNotificationRegistryFromDtoResult {
  readonly ok: boolean;
  readonly registry: ReadOnlyNotificationRegistry;
  readonly dto: NotificationRegistryDto;
  readonly diagnostics: ClientNotificationRegistryDiagnostics;
  readonly errors: readonly NotificationRegistrationIssue[];
}

/**
 * Hydrate a read-only client registry from a server-generated NotificationRegistryDto.
 *
 * The server remains authoritative — this function never registers routes or executes mappers.
 */
export function createNotificationRegistryFromDto(
  dto: unknown,
  options: CreateNotificationRegistryFromDtoOptions = {},
): CreateNotificationRegistryFromDtoResult {
  const validate = options.validate ?? true;
  const hydratedAt = options.hydratedAt ?? new Date().toISOString();

  if (!validate) {
    const payload = dto as NotificationRegistryDto;
    const routes = mapNotificationRegistryDtoToRoutes(payload.routes ?? []);
    const registry = new ClientNotificationRegistry({
      routes,
      schemaVersion: payload.schemaVersion,
      frameworkVersion: payload.frameworkVersion,
      status: routes.length > 0 ? "hydrated" : "empty",
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

  const validation = validateNotificationRegistryDto(dto);
  if (!validation.ok) {
    const registry = createInvalidClientNotificationRegistry();
    return {
      ok: false,
      registry,
      dto: validation.dto,
      diagnostics: registry.getDiagnostics(),
      errors: validation.errors,
    };
  }

  if (validation.dto.routes.length === 0) {
    const registry = createEmptyClientNotificationRegistry();
    return {
      ok: true,
      registry,
      dto: validation.dto,
      diagnostics: registry.getDiagnostics(),
      errors: [],
    };
  }

  const routes = mapNotificationRegistryDtoToRoutes(validation.dto.routes);
  const registry = new ClientNotificationRegistry({
    routes,
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

export { createEmptyNotificationRegistryDto };
