import type { VerificationHistoryEntry } from "./verification-history";
import type { VerificationId } from "./verification-id";
import type { VerificationStatus } from "./verification-status";
import type { VerificationOutcome } from "./verification-outcome";
import type { Verification } from "./verification";

/**
 * Persisted aggregate: domain Verification (which already tracks its own revision).
 * domainEvents are never persisted; loaded aggregates always have an empty list.
 */
export type StoredVerification = Omit<Verification, "domainEvents"> & {
  readonly domainEvents: readonly [];
};

export type VerificationListQuery = {
  readonly status?: VerificationStatus;
  readonly outcome?: VerificationOutcome;
  readonly subjectKind?: string;
  readonly subjectArtefactId?: string;
  readonly authorityActorId?: string;
  readonly limit?: number;
  readonly offset?: number;
};

/**
 * Persistence boundary for Verifications (APZQEP-ENG-040B Part 2 / ARCH-009).
 * Delete is intentionally absent — retire / supersede / withdraw / cancel are
 * the only terminal transitions and history is append-only.
 */
export interface VerificationRepository {
  create(verification: Verification): Promise<StoredVerification>;
  get(tenantId: string, id: VerificationId): Promise<StoredVerification | null>;
  /**
   * Persist a mutated aggregate. Requires `expectedRevision` for optimistic concurrency
   * (the revision the aggregate had before the mutation being persisted).
   */
  save(
    verification: Verification,
    expectedRevision: number,
  ): Promise<StoredVerification>;
  list(
    tenantId: string,
    query?: VerificationListQuery,
  ): Promise<readonly StoredVerification[]>;
  exists(tenantId: string, id: VerificationId): Promise<boolean>;
  listHistory(
    tenantId: string,
    id: VerificationId,
  ): Promise<readonly VerificationHistoryEntry[]>;
}
