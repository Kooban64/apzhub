import {
  EvidencePreconditionError,
  EvidenceValidationError,
} from "../../shared/errors";
import type {
  EvidenceContent,
  EvidenceIntegrity,
  EvidenceStatus,
} from "./value-objects";
import { createContentHash, createEvidenceIntegrity } from "./value-objects";

/**
 * Pure domain helpers — no I/O, no crypto.
 * Application supplies precomputed hashes; Domain validates shape and state.
 */
export const EvidenceIntegrityService = {
  /** Build integrity metadata from already-computed hash (no hashing performed). */
  fromContent(content: EvidenceContent): EvidenceIntegrity {
    return createEvidenceIntegrity({
      contentHash: content.contentHash,
      hashAlgorithm: content.hashAlgorithm,
      verificationState: "unverified",
      sealed: false,
    });
  },

  /**
   * Compare stored hash to a provided actual hash (computed outside Domain).
   * Returns updated integrity + whether verification succeeded.
   */
  compare(input: {
    readonly integrity: EvidenceIntegrity;
    readonly providedActualHash: string;
    readonly verifiedAt: string;
  }): { readonly integrity: EvidenceIntegrity; readonly matched: boolean } {
    const actual = createContentHash(
      input.providedActualHash,
      input.integrity.hashAlgorithm,
    );
    const matched = actual === input.integrity.contentHash;
    return {
      matched,
      integrity: createEvidenceIntegrity({
        contentHash: input.integrity.contentHash,
        hashAlgorithm: input.integrity.hashAlgorithm,
        verificationState: matched ? "verified" : "failed",
        lastVerifiedAt: input.verifiedAt,
        sealed: input.integrity.sealed,
      }),
    };
  },

  seal(integrity: EvidenceIntegrity): EvidenceIntegrity {
    if (!integrity.contentHash) {
      throw new EvidencePreconditionError("Cannot seal integrity without content hash");
    }
    return createEvidenceIntegrity({
      ...integrity,
      sealed: true,
    });
  },
};

export const EvidenceLifecycleService = {
  assertTransitionAllowed(
    from: EvidenceStatus,
    to: EvidenceStatus,
    allowed: ReadonlyMap<EvidenceStatus, readonly EvidenceStatus[]>,
  ): void {
    const targets = allowed.get(from) ?? [];
    if (!targets.includes(to)) {
      throw new EvidencePreconditionError(
        `Transition from ${from} to ${to} is not permitted`,
      );
    }
  },
};

export const EvidenceRetentionService = {
  isRetentionExpired(retainUntil: string | undefined, now: string): boolean {
    if (!retainUntil) {
      return true;
    }
    return retainUntil <= now;
  },

  assertRetainUntilShape(retainUntil: string | undefined): void {
    if (retainUntil === undefined) {
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}/.test(retainUntil)) {
      throw new EvidenceValidationError(
        "retainUntil must be an ISO-8601 date/time string",
      );
    }
  },
};

/** Ordered membership seal hash is supplied by Application; Domain validates non-empty. */
export const EvidenceSetSealService = {
  assertSealHash(sealHash: string): string {
    return createContentHash(sealHash);
  },
};
