import {
  EvidenceConflictError,
  EvidencePreconditionError,
  EvidenceValidationError,
} from "../../shared/errors";
import {
  CONTENT_MUTABLE_STATUSES,
  DISPOSE_ELIGIBLE_STATUSES,
  REASON_MIN,
  TERMINAL_STATUSES,
} from "./constants";
import type {
  EvidenceContent,
  EvidenceIntegrity,
  EvidenceStatus,
} from "./value-objects";

export const LifecyclePolicy = {
  assertStatus(
    current: EvidenceStatus,
    expected: EvidenceStatus,
    command: string,
  ): void {
    if (current !== expected) {
      throw new EvidencePreconditionError(
        `${command} requires status ${expected}, found ${current}`,
      );
    }
  },

  assertOneOf(
    current: EvidenceStatus,
    expected: readonly EvidenceStatus[],
    command: string,
  ): void {
    if (!expected.includes(current)) {
      throw new EvidencePreconditionError(
        `${command} requires status one of [${expected.join(", ")}], found ${current}`,
      );
    }
  },

  assertNotTerminal(current: EvidenceStatus, command: string): void {
    if ((TERMINAL_STATUSES as readonly string[]).includes(current)) {
      throw new EvidenceConflictError(
        `${command} is not allowed when status is ${current}`,
      );
    }
  },
};

export const ContentMutationPolicy = {
  assertMutable(status: EvidenceStatus, sealed: boolean, command: string): void {
    if (sealed || status === "sealed") {
      throw new EvidenceConflictError(`${command} is not allowed after seal`);
    }
    if (status === "disposed") {
      throw new EvidenceConflictError(`${command} is not allowed after disposition`);
    }
    if (!(CONTENT_MUTABLE_STATUSES as readonly string[]).includes(status)) {
      throw new EvidencePreconditionError(
        `${command} is not allowed in status ${status}`,
      );
    }
  },
};

export const SealPolicy = {
  assertCanSeal(status: EvidenceStatus, integrity: EvidenceIntegrity): void {
    LifecyclePolicy.assertStatus(status, "approved", "sealEvidence");
    if (!integrity.contentHash) {
      throw new EvidencePreconditionError("sealEvidence requires content hash");
    }
    if (integrity.sealed) {
      throw new EvidenceConflictError("Evidence is already sealed");
    }
  },
};

export const DisposePolicy = {
  assertCanDispose(input: {
    readonly status: EvidenceStatus;
    readonly legalHold: boolean;
    readonly retainUntil?: string;
    readonly now: string;
    readonly reason: string;
  }): void {
    LifecyclePolicy.assertOneOf(
      input.status,
      DISPOSE_ELIGIBLE_STATUSES as unknown as EvidenceStatus[],
      "disposeEvidence",
    );
    if (input.legalHold) {
      throw new EvidencePreconditionError(
        "disposeEvidence is prohibited while legalHold is true",
      );
    }
    if (input.retainUntil && input.retainUntil > input.now) {
      throw new EvidencePreconditionError(
        "disposeEvidence requires retention period to have expired",
      );
    }
    ReasonPolicy.assertReason(input.reason, "disposeEvidence");
  },
};

export const HoldPolicy = {
  assertCanApply(status: EvidenceStatus, reason: string): void {
    LifecyclePolicy.assertNotTerminal(status, "applyLegalHold");
    ReasonPolicy.assertReason(reason, "applyLegalHold");
  },

  assertCanRelease(status: EvidenceStatus, legalHold: boolean): void {
    LifecyclePolicy.assertNotTerminal(status, "releaseLegalHold");
    if (!legalHold) {
      throw new EvidencePreconditionError("legalHold is not currently applied");
    }
  },
};

export const ContentPolicy = {
  assertPresent(content: EvidenceContent | null, command: string): EvidenceContent {
    if (!content) {
      throw new EvidencePreconditionError(`${command} requires attached content`);
    }
    return content;
  },
};

export const ReasonPolicy = {
  assertReason(reason: string, command: string): string {
    const trimmed = reason.trim();
    if (trimmed.length < REASON_MIN) {
      throw new EvidenceValidationError(
        `${command} requires reason of at least ${REASON_MIN} characters`,
      );
    }
    return trimmed;
  },
};

export const OwnershipPolicy = {
  assertSameTenant(expectedTenantId: string, actualTenantId: string): void {
    if (expectedTenantId !== actualTenantId) {
      throw new EvidencePreconditionError("Tenant mismatch for evidence operation");
    }
  },
};
