"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { createKnowledgeService } from "../client/service";
import type { KnowledgeService } from "../client/service";
import {
  createPlaceholderKnowledgeQueryClient,
  type KnowledgeQueryClient,
} from "../client/query";
import {
  KnowledgeRegistryProvider,
  type KnowledgeRegistryProviderProps,
} from "./knowledge-registry-context";

const KnowledgeServiceContext = createContext<KnowledgeService | null>(null);

export interface KnowledgeServiceProviderProps {
  readonly service?: KnowledgeService;
  /** Internal — prefer {@link KnowledgeService}. Used by tests and legacy wiring. */
  readonly queryClient?: KnowledgeQueryClient;
  readonly children: ReactNode;
}

export function KnowledgeServiceProvider({
  service,
  queryClient,
  children,
}: KnowledgeServiceProviderProps) {
  const resolvedService = useMemo(
    () =>
      service ??
      createKnowledgeService({
        queryClient: queryClient ?? createPlaceholderKnowledgeQueryClient(),
      }),
    [service, queryClient],
  );

  return (
    <KnowledgeServiceContext.Provider value={resolvedService}>
      {children}
    </KnowledgeServiceContext.Provider>
  );
}

export function useKnowledgeServiceContext(): KnowledgeService {
  const context = useContext(KnowledgeServiceContext);

  if (!context) {
    throw new Error(
      "useKnowledgeService must be used within KnowledgeDiscoveryProvider",
    );
  }

  return context;
}

export interface KnowledgeDiscoveryProviderProps extends KnowledgeRegistryProviderProps {
  /** Public query boundary — preferred over queryClient (DF-015). */
  readonly service?: KnowledgeService;
  /** Internal orchestrator adapter — wrapped by {@link createKnowledgeService}. */
  readonly queryClient?: KnowledgeQueryClient;
}

/**
 * Composes registry hydration (DF-010) with Knowledge Service DI (DF-015).
 *
 * Knowledge Experiences consume `useKnowledgeRegistry()` and `useKnowledgeService()`.
 */
export function KnowledgeDiscoveryProvider({
  dto,
  service,
  queryClient,
  children,
}: KnowledgeDiscoveryProviderProps) {
  return (
    <KnowledgeRegistryProvider dto={dto}>
      <KnowledgeServiceProvider service={service} queryClient={queryClient}>
        {children}
      </KnowledgeServiceProvider>
    </KnowledgeRegistryProvider>
  );
}

/** @deprecated Use useKnowledgeServiceContext — internal query client access only. */
export function useKnowledgeQueryClientContext(): KnowledgeQueryClient {
  throw new Error(
    "KnowledgeQueryClient is internal — use useKnowledgeService() from KnowledgeDiscoveryProvider",
  );
}

/** @deprecated Use KnowledgeServiceProvider */
export const KnowledgeQueryProvider = KnowledgeServiceProvider;

export type KnowledgeQueryProviderProps = KnowledgeServiceProviderProps;
