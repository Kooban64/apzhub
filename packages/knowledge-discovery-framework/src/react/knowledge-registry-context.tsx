import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  createKnowledgeRegistryFromDto,
  type ClientKnowledgeRegistryDiagnostics,
  type ReadOnlyKnowledgeRegistry,
} from "../client";
import type { KnowledgeRegistrationIssue } from "../types/knowledge-diagnostics";
import type { KnowledgeSourceRegistryDto } from "../server/map-knowledge-source-registry-dto";

export interface KnowledgeRegistryContextValue {
  readonly registry: ReadOnlyKnowledgeRegistry;
  readonly dto: KnowledgeSourceRegistryDto;
  readonly isReady: boolean;
  readonly diagnostics: ClientKnowledgeRegistryDiagnostics;
  readonly importErrors: readonly KnowledgeRegistrationIssue[];
}

const KnowledgeRegistryContext = createContext<KnowledgeRegistryContextValue | null>(
  null,
);

export interface KnowledgeRegistryProviderProps {
  /** Permission-filtered server DTO — authoritative registry snapshot. */
  readonly dto: KnowledgeSourceRegistryDto;
  readonly children: ReactNode;
}

/**
 * Hydrates a read-only client knowledge registry from the server DTO.
 *
 * Current model: one-way hydration (server → client). See `client/synchronisation.ts`
 * for future synchronisation extension points.
 */
export function KnowledgeRegistryProvider({
  dto,
  children,
}: KnowledgeRegistryProviderProps) {
  const value = useMemo<KnowledgeRegistryContextValue>(() => {
    const hydration = createKnowledgeRegistryFromDto(dto);

    return {
      registry: hydration.registry,
      dto: hydration.dto,
      isReady: hydration.ok,
      diagnostics: hydration.diagnostics,
      importErrors: hydration.errors,
    };
  }, [dto]);

  return (
    <KnowledgeRegistryContext.Provider value={value}>
      {children}
    </KnowledgeRegistryContext.Provider>
  );
}

export function useKnowledgeRegistryContext(): KnowledgeRegistryContextValue {
  const context = useContext(KnowledgeRegistryContext);

  if (!context) {
    throw new Error(
      "useKnowledgeRegistry must be used within KnowledgeRegistryProvider",
    );
  }

  return context;
}
