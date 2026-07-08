import { useCallback, useMemo } from "react";

import type { KnowledgeSource } from "../types/knowledge-source";
import type { ClientKnowledgeRegistryDiagnostics } from "../client";
import type { KnowledgeRegistrationIssue } from "../types/knowledge-diagnostics";
import type { KnowledgeSourceRegistryDto } from "../server/map-knowledge-source-registry-dto";
import { useKnowledgeRegistryContext } from "./knowledge-registry-context";

export interface UseKnowledgeRegistryResult {
  readonly isReady: boolean;
  readonly sources: readonly KnowledgeSource[];
  readonly schemaVersion: KnowledgeSourceRegistryDto["schemaVersion"];
  readonly frameworkVersion?: string;
  readonly has: (sourceId: string) => boolean;
  readonly get: (sourceId: string) => KnowledgeSource | undefined;
  readonly list: () => readonly KnowledgeSource[];
  readonly diagnostics: ClientKnowledgeRegistryDiagnostics;
  readonly importErrors: readonly KnowledgeRegistrationIssue[];
}

/**
 * Access the hydrated read-only knowledge registry from React context.
 *
 * Future Knowledge Experience surfaces (Search, Help, AI Assistant, Recommendations)
 * consume this registry together with {@link useKnowledgeQuery} (DF-011).
 */
export function useKnowledgeRegistry(): UseKnowledgeRegistryResult {
  const { registry, dto, isReady, diagnostics, importErrors } =
    useKnowledgeRegistryContext();

  const sources = useMemo(() => registry.list(), [registry]);

  const has = useCallback((sourceId: string) => registry.has(sourceId), [registry]);

  const get = useCallback((sourceId: string) => registry.get(sourceId), [registry]);

  const list = useCallback(() => registry.list(), [registry]);

  return {
    isReady,
    sources,
    schemaVersion: dto.schemaVersion,
    frameworkVersion: dto.frameworkVersion,
    has,
    get,
    list,
    diagnostics,
    importErrors,
  };
}
