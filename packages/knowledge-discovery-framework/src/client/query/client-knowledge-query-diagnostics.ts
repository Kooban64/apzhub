import type { KnowledgeQueryDiagnostics } from "../../orchestrator/knowledge-query-diagnostics";
import type { ClientKnowledgeRegistryDiagnostics } from "../client-knowledge-registry-diagnostics";
import type {
  KnowledgeQueryError,
  KnowledgeQueryStatus,
} from "./knowledge-query-lifecycle";
import type { KnowledgeQueryClientDiagnostics } from "./knowledge-query-client";

/** Client-side query observability — registry + lifecycle + orchestrator diagnostics (DF-011). */
export interface ClientKnowledgeQueryDiagnostics {
  readonly status: KnowledgeQueryStatus;
  readonly registryReady: boolean;
  readonly registryStatus?: ClientKnowledgeRegistryDiagnostics["status"];
  readonly schemaVersion?: ClientKnowledgeRegistryDiagnostics["schemaVersion"];
  readonly frameworkVersion?: string;
  readonly sourceCount?: number;
  readonly queryClient: KnowledgeQueryClientDiagnostics;
  readonly query?: KnowledgeQueryDiagnostics;
  readonly error?: KnowledgeQueryError;
  readonly queriedAt?: string;
}

export function buildClientKnowledgeQueryDiagnostics(options: {
  readonly status: KnowledgeQueryStatus;
  readonly registryDiagnostics: ClientKnowledgeRegistryDiagnostics;
  readonly registryReady: boolean;
  readonly queryClientDiagnostics: KnowledgeQueryClientDiagnostics;
  readonly query?: KnowledgeQueryDiagnostics;
  readonly error?: KnowledgeQueryError;
  readonly queriedAt?: string;
}): ClientKnowledgeQueryDiagnostics {
  return {
    status: options.status,
    registryReady: options.registryReady,
    registryStatus: options.registryDiagnostics.status,
    schemaVersion: options.registryDiagnostics.schemaVersion,
    frameworkVersion: options.registryDiagnostics.frameworkVersion,
    sourceCount: options.registryDiagnostics.sourceCount,
    queryClient: options.queryClientDiagnostics,
    query: options.query,
    error: options.error,
    queriedAt: options.queriedAt,
  };
}

export function createIdleClientKnowledgeQueryDiagnostics(
  registryDiagnostics: ClientKnowledgeRegistryDiagnostics,
  queryClientDiagnostics: KnowledgeQueryClientDiagnostics,
  registryReady: boolean,
): ClientKnowledgeQueryDiagnostics {
  return buildClientKnowledgeQueryDiagnostics({
    status: "idle",
    registryDiagnostics,
    registryReady,
    queryClientDiagnostics,
  });
}
