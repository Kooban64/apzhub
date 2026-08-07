"use client";

import type { AuthSessionPermissionInput } from "@apzhub/workbench-framework";
import { createContext, useContext, type ReactNode } from "react";

const SessionAuthorizationContext = createContext<AuthSessionPermissionInput | null>(
  null,
);

/**
 * Hydrates APZHUB session roles/permissions for Law product UIs.
 * Products consume this — they never own identity.
 */
export function SessionAuthorizationProvider({
  value,
  children,
}: {
  readonly value: AuthSessionPermissionInput | null;
  readonly children: ReactNode;
}) {
  return (
    <SessionAuthorizationContext.Provider value={value}>
      {children}
    </SessionAuthorizationContext.Provider>
  );
}

export function useSessionAuthorization(): AuthSessionPermissionInput | null {
  return useContext(SessionAuthorizationContext);
}

/** Effective permission keys from the APZHUB session (empty when unsigned / unset). */
export function useSessionPermissions(): readonly string[] {
  return useSessionAuthorization()?.permissions ?? [];
}
