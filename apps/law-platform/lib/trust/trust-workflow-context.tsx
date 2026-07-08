"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { getSharedTrustWorkbench } from "./shared-trust-workbench";
import { TrustWorkbenchService } from "./trust-workbench-service";

const TrustWorkflowContext = createContext<TrustWorkbenchService | null>(null);

export interface TrustWorkflowProviderProps {
  readonly service?: TrustWorkbenchService;
  readonly children: ReactNode;
}

export function TrustWorkflowProvider({
  service,
  children,
}: TrustWorkflowProviderProps) {
  const resolved = useMemo(
    () => service ?? new TrustWorkbenchService(getSharedTrustWorkbench()),
    [service],
  );

  return (
    <TrustWorkflowContext.Provider value={resolved}>
      {children}
    </TrustWorkflowContext.Provider>
  );
}

export function useTrustWorkflow(): TrustWorkbenchService {
  const service = useContext(TrustWorkflowContext);
  if (!service) {
    throw new Error("useTrustWorkflow must be used within TrustWorkflowProvider");
  }

  return service;
}
