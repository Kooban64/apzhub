import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { NotificationService } from "../notification/notification-service";
import type { NotificationServiceDiagnostics } from "../types/diagnostics";
import { createDefaultNotificationService } from "../notification/default-notification-service";

export interface NotificationServiceContextValue {
  readonly service: NotificationService;
  readonly diagnostics: NotificationServiceDiagnostics;
}

const NotificationServiceContext =
  createContext<NotificationServiceContextValue | null>(null);

export interface NotificationServiceProviderProps {
  /** Optional service instance — defaults to DefaultNotificationService. */
  readonly service?: NotificationService;
  readonly children: ReactNode;
}

/**
 * Provides the public Notification Service boundary to React consumers.
 * No UI, delivery, or persistence — read/query APIs only.
 */
export function NotificationServiceProvider({
  service,
  children,
}: NotificationServiceProviderProps) {
  const resolvedService = useMemo(
    () => service ?? createDefaultNotificationService(),
    [service],
  );

  const value = useMemo<NotificationServiceContextValue>(
    () => ({
      service: resolvedService,
      diagnostics: resolvedService.getDiagnostics(),
    }),
    [resolvedService],
  );

  return (
    <NotificationServiceContext.Provider value={value}>
      {children}
    </NotificationServiceContext.Provider>
  );
}

export function useNotificationServiceContext(): NotificationServiceContextValue {
  const context = useContext(NotificationServiceContext);

  if (!context) {
    throw new Error(
      "useNotificationService must be used within NotificationServiceProvider",
    );
  }

  return context;
}
