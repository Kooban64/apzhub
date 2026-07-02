"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

export interface ToolbarProviderValue {
  readonly region: string;
}

const ToolbarContext = createContext<ToolbarProviderValue | null>(null);

export interface ToolbarProviderProps {
  /** Toolbar region id — default `workspace` (ADR-0025). */
  readonly region?: string;
  readonly children: ReactNode;
}

/** Supplies toolbar region context for Workbench Toolbar surfaces. */
export function ToolbarProvider({
  region = "workspace",
  children,
}: ToolbarProviderProps) {
  const value = useMemo(() => ({ region }), [region]);

  return <ToolbarContext.Provider value={value}>{children}</ToolbarContext.Provider>;
}

export function useToolbarProvider(): ToolbarProviderValue {
  const context = useContext(ToolbarContext);

  if (!context) {
    throw new Error("useToolbarProvider must be used within ToolbarProvider");
  }

  return context;
}
