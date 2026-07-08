/**
 * Registry synchronisation model — AT-009 hydration only.
 *
 * Server bootstrap → ActivityTimelineHydrationBundle → createActivityTimelineContextFromDto()
 * → read-only client registries. No client-side registration.
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
