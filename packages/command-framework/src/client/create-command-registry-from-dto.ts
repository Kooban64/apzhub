import type { ActionRegistrationIssue } from "../registry/action-batch-registration";
import type { ActionRegistryDto } from "../server/map-action-registry-dto";
import {
  bootstrapShortcutRegistry,
  type BootstrapShortcutRegistryResult,
} from "../shortcuts";
import {
  ClientActionRegistry,
  createEmptyClientActionRegistry,
  createInvalidClientActionRegistry,
} from "./client-action-registry";
import type { ClientActionRegistryDiagnostics } from "./client-action-registry-diagnostics";
import type { ReadOnlyActionRegistry } from "./read-only-action-registry";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { validateActionRegistryDto } from "./validate-action-registry-dto";

export interface CreateCommandRegistryFromDtoOptions {
  /** When false, skips descriptor validation (tests only). Default true. */
  readonly validate?: boolean;
  readonly hydratedAt?: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}

export interface CreateCommandRegistryFromDtoResult {
  readonly ok: boolean;
  readonly registry: ReadOnlyActionRegistry;
  readonly shortcuts: BootstrapShortcutRegistryResult;
  readonly dto: ActionRegistryDto;
  readonly diagnostics: ClientActionRegistryDiagnostics;
  readonly errors: readonly ActionRegistrationIssue[];
}

/**
 * Hydrate a read-only client registry from a server-generated ActionRegistryDto.
 *
 * The server remains authoritative — this function never registers or mutates server state.
 */
export function createCommandRegistryFromDto(
  dto: unknown,
  options: CreateCommandRegistryFromDtoOptions = {},
): CreateCommandRegistryFromDtoResult {
  const validate = options.validate ?? true;
  const hydratedAt = options.hydratedAt ?? new Date().toISOString();

  if (!validate) {
    const payload = dto as ActionRegistryDto;
    const registry = new ClientActionRegistry({
      actions: payload.actions ?? [],
      toolbarRegionCount: payload.toolbar?.length ?? 0,
      status: (payload.actions?.length ?? 0) > 0 ? "hydrated" : "empty",
      hydratedAt,
      synchronisation: options.synchronisation,
    });

    return {
      ok: true,
      registry,
      shortcuts: bootstrapShortcutRegistry(payload.actions ?? []),
      dto: payload,
      diagnostics: registry.getDiagnostics(),
      errors: [],
    };
  }

  const validation = validateActionRegistryDto(dto);
  if (!validation.ok) {
    const registry = createInvalidClientActionRegistry();
    return {
      ok: false,
      registry,
      shortcuts: bootstrapShortcutRegistry([]),
      dto: validation.dto,
      diagnostics: registry.getDiagnostics(),
      errors: validation.errors,
    };
  }

  if (validation.dto.actions.length === 0) {
    const registry = createEmptyClientActionRegistry();
    return {
      ok: true,
      registry,
      shortcuts: bootstrapShortcutRegistry([]),
      dto: validation.dto,
      diagnostics: registry.getDiagnostics(),
      errors: [],
    };
  }

  const registry = new ClientActionRegistry({
    actions: validation.dto.actions,
    toolbarRegionCount: validation.dto.toolbar.length,
    status: "hydrated",
    hydratedAt,
    synchronisation: options.synchronisation,
  });

  return {
    ok: true,
    registry,
    shortcuts: bootstrapShortcutRegistry(validation.dto.actions),
    dto: validation.dto,
    diagnostics: registry.getDiagnostics(),
    errors: [],
  };
}
