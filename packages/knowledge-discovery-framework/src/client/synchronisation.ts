/**
 * Registry synchronisation model — DF-010 hydration only.
 *
 * ## Current (DF-010)
 *
 * ```text
 * Server bootstrap → KnowledgeSourceRegistryDto → createKnowledgeRegistryFromDto() → ClientKnowledgeRegistry
 * ```
 *
 * The server is authoritative. The browser receives a permission-filtered DTO and
 * constructs a read-only client registry. No registration or mutation occurs on the client.
 *
 * ## Future (not implemented)
 *
 * ```text
 * Server ↔ Client synchronisation
 *   - revision / etag on KnowledgeSourceRegistryDto
 *   - push: server broadcasts registry patches after capability reload
 *   - pull: client requests delta since last revision
 *   - reconcile: merge patches into ClientKnowledgeRegistry without full reload
 * ```
 *
 * Extension points reserved on {@link ClientRegistrySynchronisationState}.
 */

/** How the client registry was populated — `hydration` today; `synchronisation` in future stories. */
export type ClientRegistrySyncMode = "hydration" | "synchronisation";

/**
 * Tracks client registry provenance and future sync metadata.
 * Only `mode: "hydration"` is used in DF-010.
 */
export interface ClientRegistrySynchronisationState {
  readonly mode: ClientRegistrySyncMode;
  /** Server registry revision — reserved for future delta sync (DF-015+). */
  readonly revision?: string;
  /** ISO timestamp of last successful DTO import or sync — reserved. */
  readonly lastSyncedAt?: string;
}

export const CLIENT_REGISTRY_HYDRATION_SYNC_STATE: ClientRegistrySynchronisationState =
  Object.freeze({
    mode: "hydration",
  });
