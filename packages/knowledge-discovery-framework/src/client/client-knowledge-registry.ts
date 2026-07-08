import { freezeKnowledgeSource } from "../registry/freeze";
import type { KnowledgeSource } from "../types/knowledge-source";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "../server/knowledge-source-registry-schema-version";
import {
  buildClientKnowledgeRegistryDiagnostics,
  type ClientKnowledgeRegistryDiagnostics,
  type ClientKnowledgeRegistryStatus,
} from "./client-knowledge-registry-diagnostics";
import type { ReadOnlyKnowledgeRegistry } from "./read-only-knowledge-registry";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

export interface ClientKnowledgeRegistrySnapshot {
  readonly sources: readonly KnowledgeSource[];
  readonly schemaVersion?: typeof KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION;
  readonly frameworkVersion?: string;
  readonly status?: ClientKnowledgeRegistryStatus;
  readonly hydratedAt?: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}

/**
 * In-memory read-only knowledge source index hydrated from a server DTO.
 * Descriptors are deep-frozen — callers cannot mutate registry contents.
 */
export class ClientKnowledgeRegistry implements ReadOnlyKnowledgeRegistry {
  private readonly sources = new Map<string, KnowledgeSource>();
  private readonly diagnosticsSnapshot: ClientKnowledgeRegistryDiagnostics;

  constructor(snapshot: ClientKnowledgeRegistrySnapshot = { sources: [] }) {
    for (const source of snapshot.sources) {
      this.sources.set(source.id, freezeKnowledgeSource(source));
    }

    this.diagnosticsSnapshot = buildClientKnowledgeRegistryDiagnostics(
      [...this.sources.values()],
      {
        status: snapshot.status,
        schemaVersion: snapshot.schemaVersion,
        frameworkVersion: snapshot.frameworkVersion,
        hydratedAt: snapshot.hydratedAt,
        synchronisation:
          snapshot.synchronisation ?? CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
      },
    );
  }

  has(sourceId: string): boolean {
    return this.sources.has(sourceId);
  }

  get(sourceId: string): KnowledgeSource | undefined {
    const source = this.sources.get(sourceId);
    return source ? freezeKnowledgeSource(source) : undefined;
  }

  list(): readonly KnowledgeSource[] {
    return Object.freeze(
      [...this.sources.values()].sort(
        (left, right) =>
          left.priority - right.priority || left.id.localeCompare(right.id),
      ),
    );
  }

  getDiagnostics(): ClientKnowledgeRegistryDiagnostics {
    return this.diagnosticsSnapshot;
  }
}

export function createEmptyClientKnowledgeRegistry(): ReadOnlyKnowledgeRegistry {
  return new ClientKnowledgeRegistry({
    sources: [],
    status: "empty",
  });
}

export function createInvalidClientKnowledgeRegistry(): ReadOnlyKnowledgeRegistry {
  return new ClientKnowledgeRegistry({
    sources: [],
    status: "invalid",
  });
}
