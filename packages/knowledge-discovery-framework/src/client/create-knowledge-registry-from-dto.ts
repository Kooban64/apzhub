import type { KnowledgeRegistrationIssue } from "../types/knowledge-diagnostics";
import type { KnowledgeSourceRegistryDto } from "../server/map-knowledge-source-registry-dto";
import { createEmptyKnowledgeSourceRegistryDto } from "../server/map-knowledge-source-registry-dto";
import {
  ClientKnowledgeRegistry,
  createEmptyClientKnowledgeRegistry,
  createInvalidClientKnowledgeRegistry,
} from "./client-knowledge-registry";
import type { ClientKnowledgeRegistryDiagnostics } from "./client-knowledge-registry-diagnostics";
import { mapKnowledgeSourceRegistryDtoToSources } from "./map-dto-to-knowledge-sources";
import type { ReadOnlyKnowledgeRegistry } from "./read-only-knowledge-registry";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { validateKnowledgeSourceRegistryDto } from "./validate-knowledge-source-registry-dto";

export interface CreateKnowledgeRegistryFromDtoOptions {
  /** When false, skips descriptor validation (tests only). Default true. */
  readonly validate?: boolean;
  readonly hydratedAt?: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}

export interface CreateKnowledgeRegistryFromDtoResult {
  readonly ok: boolean;
  readonly registry: ReadOnlyKnowledgeRegistry;
  readonly dto: KnowledgeSourceRegistryDto;
  readonly diagnostics: ClientKnowledgeRegistryDiagnostics;
  readonly errors: readonly KnowledgeRegistrationIssue[];
}

/**
 * Hydrate a read-only client registry from a server-generated KnowledgeSourceRegistryDto.
 *
 * The server remains authoritative — this function never registers or mutates server state.
 */
export function createKnowledgeRegistryFromDto(
  dto: unknown,
  options: CreateKnowledgeRegistryFromDtoOptions = {},
): CreateKnowledgeRegistryFromDtoResult {
  const validate = options.validate ?? true;
  const hydratedAt = options.hydratedAt ?? new Date().toISOString();

  if (!validate) {
    const payload = dto as KnowledgeSourceRegistryDto;
    const sources = mapKnowledgeSourceRegistryDtoToSources(payload.sources ?? []);
    const registry = new ClientKnowledgeRegistry({
      sources,
      schemaVersion: payload.schemaVersion,
      frameworkVersion: payload.frameworkVersion,
      status: sources.length > 0 ? "hydrated" : "empty",
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

  const validation = validateKnowledgeSourceRegistryDto(dto);
  if (!validation.ok) {
    const registry = createInvalidClientKnowledgeRegistry();
    return {
      ok: false,
      registry,
      dto: validation.dto,
      diagnostics: registry.getDiagnostics(),
      errors: validation.errors,
    };
  }

  if (validation.dto.sources.length === 0) {
    const registry = createEmptyClientKnowledgeRegistry();
    return {
      ok: true,
      registry,
      dto: validation.dto,
      diagnostics: registry.getDiagnostics(),
      errors: [],
    };
  }

  const sources = mapKnowledgeSourceRegistryDtoToSources(validation.dto.sources);
  const registry = new ClientKnowledgeRegistry({
    sources,
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

export { createEmptyKnowledgeSourceRegistryDto };
