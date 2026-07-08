/**
 * Registry synchronisation model — EN-010 hydration only.
 *
 * Server bootstrap → NotificationRegistryDto → createNotificationRegistryFromDto()
 * → ClientNotificationRegistry. No client-side registration.
 */

export type ClientRegistrySyncMode = "hydration" | "synchronisation";

export interface ClientRegistrySynchronisationState {
  readonly mode: ClientRegistrySyncMode;
  readonly revision?: string;
  readonly lastSyncedAt?: string;
}

export const CLIENT_REGISTRY_HYDRATION_SYNC_STATE: ClientRegistrySynchronisationState =
  Object.freeze({
    mode: "hydration",
  });
