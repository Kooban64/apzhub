import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  createNotificationRegistryFromDto,
  type ClientNotificationRegistryDiagnostics,
  type ReadOnlyNotificationRegistry,
} from "../client";
import type { NotificationRegistrationIssue } from "../notification/notification-metadata";
import type { NotificationRegistryDto } from "../server/map-notification-registry-dto";

export interface NotificationRegistryContextValue {
  readonly registry: ReadOnlyNotificationRegistry;
  readonly dto: NotificationRegistryDto;
  readonly isReady: boolean;
  readonly diagnostics: ClientNotificationRegistryDiagnostics;
  readonly importErrors: readonly NotificationRegistrationIssue[];
}

const NotificationRegistryContext =
  createContext<NotificationRegistryContextValue | null>(null);

export interface NotificationRegistryProviderProps {
  /** Permission-filtered server DTO — authoritative registry snapshot. */
  readonly dto: NotificationRegistryDto;
  readonly children: ReactNode;
}

/**
 * Hydrates a read-only client notification registry from the server DTO.
 *
 * One-way hydration (server → client). No client-side registration or mapper execution.
 */
export function NotificationRegistryProvider({
  dto,
  children,
}: NotificationRegistryProviderProps) {
  const value = useMemo<NotificationRegistryContextValue>(() => {
    const hydration = createNotificationRegistryFromDto(dto);

    return {
      registry: hydration.registry,
      dto: hydration.dto,
      isReady: hydration.ok,
      diagnostics: hydration.diagnostics,
      importErrors: hydration.errors,
    };
  }, [dto]);

  return (
    <NotificationRegistryContext.Provider value={value}>
      {children}
    </NotificationRegistryContext.Provider>
  );
}

export function useNotificationRegistryContext(): NotificationRegistryContextValue {
  const context = useContext(NotificationRegistryContext);

  if (!context) {
    throw new Error(
      "useNotificationRegistry must be used within NotificationRegistryProvider",
    );
  }

  return context;
}
