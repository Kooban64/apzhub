import type { KnowledgeSource } from "../types/knowledge-source";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "../server/knowledge-source-registry-schema-version";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

export type ClientKnowledgeRegistryStatus = "empty" | "hydrated" | "invalid";

/** Client-side registry reporting — mirrors server split without mutation APIs. */
export interface ClientKnowledgeRegistryDiagnostics {
  readonly status: ClientKnowledgeRegistryStatus;
  readonly schemaVersion: typeof KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION;
  readonly frameworkVersion?: string;
  readonly sourceCount: number;
  readonly activeSourceCount: number;
  readonly sourceIds: readonly string[];
  readonly builtinSourceCount: number;
  readonly manifestSourceCount: number;
  readonly builtinSourceIds: readonly string[];
  readonly manifestSourceIds: readonly string[];
  readonly hydratedAt?: string;
  readonly source: "server-dto";
  readonly synchronisation: ClientRegistrySynchronisationState;
}

export function buildClientKnowledgeRegistryDiagnostics(
  sources: readonly KnowledgeSource[],
  options: {
    readonly status?: ClientKnowledgeRegistryStatus;
    readonly schemaVersion?: typeof KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION;
    readonly frameworkVersion?: string;
    readonly hydratedAt?: string;
    readonly synchronisation?: ClientRegistrySynchronisationState;
  } = {},
): ClientKnowledgeRegistryDiagnostics {
  const sourceIds: string[] = [];
  const builtinSourceIds: string[] = [];
  const manifestSourceIds: string[] = [];
  let activeSourceCount = 0;

  for (const source of sources) {
    sourceIds.push(source.id);

    if (source.status === "active") {
      activeSourceCount += 1;
    }

    if (source.origin === "builtin") {
      builtinSourceIds.push(source.id);
    } else if (source.origin === "manifest") {
      manifestSourceIds.push(source.id);
    }
  }

  sourceIds.sort();
  builtinSourceIds.sort();
  manifestSourceIds.sort();

  const status = options.status ?? (sources.length > 0 ? "hydrated" : "empty");

  return {
    status,
    schemaVersion:
      options.schemaVersion ?? KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: options.frameworkVersion,
    sourceCount: sources.length,
    activeSourceCount,
    sourceIds: Object.freeze([...sourceIds]),
    builtinSourceCount: builtinSourceIds.length,
    manifestSourceCount: manifestSourceIds.length,
    builtinSourceIds: Object.freeze([...builtinSourceIds]),
    manifestSourceIds: Object.freeze([...manifestSourceIds]),
    hydratedAt: options.hydratedAt,
    source: "server-dto",
    synchronisation: options.synchronisation ?? CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  };
}

export function createEmptyClientKnowledgeRegistryDiagnostics(): ClientKnowledgeRegistryDiagnostics {
  return buildClientKnowledgeRegistryDiagnostics([], { status: "empty" });
}
