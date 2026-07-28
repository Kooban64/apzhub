import { TestSpecificationInvariantViolation } from "../../shared/errors";
import type { SpecificationId } from "./specification-id";
import {
  isEditableSpecificationStatus,
  isImmutableSpecificationStatus,
  type SpecificationStatus,
} from "./specification-status";
import type { SpecificationReference, SpecificationVersion } from "./value-objects";

/** Pure, side-effect-free assertion policies for the Test Specification aggregate. */

export const LifecyclePolicy = {
  assertEditable(status: SpecificationStatus): void {
    if (!isEditableSpecificationStatus(status)) {
      throw new TestSpecificationInvariantViolation(
        `Only Draft Specifications may be edited (found ${status})`,
      );
    }
  },
  assertAuthoritativeOnlyWhenApproved(
    status: SpecificationStatus,
    isAuthoritative: boolean,
  ): void {
    if (isAuthoritative && status !== "approved") {
      throw new TestSpecificationInvariantViolation(
        "Only Approved Specifications may be authoritative",
      );
    }
  },
  assertRejectedCannotBecomeApproved(from: SpecificationStatus, to: SpecificationStatus): void {
    if (from === "rejected" && to === "approved") {
      throw new TestSpecificationInvariantViolation(
        "Rejected Specifications cannot become Approved",
      );
    }
  },
};

export const ImmutabilityPolicy = {
  assertMutable(status: SpecificationStatus): void {
    if (isImmutableSpecificationStatus(status)) {
      throw new TestSpecificationInvariantViolation(
        `Specification in ${status} state is immutable`,
      );
    }
  },
  assertNotSupersededOrRetired(status: SpecificationStatus): void {
    if (status === "superseded" || status === "retired") {
      throw new TestSpecificationInvariantViolation(
        `Specification in ${status} state is immutable`,
      );
    }
  },
  assertApprovedImmutableForContent(status: SpecificationStatus): void {
    if (status === "approved") {
      throw new TestSpecificationInvariantViolation(
        "Approved Specifications are immutable",
      );
    }
  },
};

export const ApprovalPolicy = {
  assertCanApprove(status: SpecificationStatus): void {
    if (status !== "under_review") {
      throw new TestSpecificationInvariantViolation(
        "Specification may only be approved from UnderReview",
      );
    }
  },
  assertCanReject(status: SpecificationStatus): void {
    if (status !== "under_review") {
      throw new TestSpecificationInvariantViolation(
        "Specification may only be rejected from UnderReview",
      );
    }
  },
};

export const ReviewPolicy = {
  assertCanStartReview(status: SpecificationStatus): void {
    if (status !== "draft") {
      throw new TestSpecificationInvariantViolation(
        "Specification review may only start from Draft",
      );
    }
  },
  assertReviewerPresent(reviewerId: string | undefined): void {
    if (!reviewerId?.trim()) {
      throw new TestSpecificationInvariantViolation(
        "Specification review requires a reviewer",
      );
    }
  },
};

export const OwnershipPolicy = {
  assertOwnerPresent(owner: string | undefined): void {
    if (!owner?.trim()) {
      throw new TestSpecificationInvariantViolation("Specification owner is required");
    }
  },
  assertTransferActor(actorId: string): void {
    if (!actorId.trim()) {
      throw new TestSpecificationInvariantViolation(
        "Specification ownership transfer requires an actor",
      );
    }
  },
};

export const RelationshipPolicy = {
  assertNotSelf(specificationId: SpecificationId, artefactId: string): void {
    if (specificationId === artefactId) {
      throw new TestSpecificationInvariantViolation(
        "Specification relationships cannot reference self",
      );
    }
  },
  assertReferencePresent(reference: SpecificationReference | undefined): void {
    if (!reference?.artefactId?.trim()) {
      throw new TestSpecificationInvariantViolation(
        "Specification relationship requires a reference",
      );
    }
  },
};

export const PriorityPolicy = {
  assertKnownPriority(priority: string): void {
    const allowed = ["critical", "high", "medium", "low"];
    if (!allowed.includes(priority)) {
      throw new TestSpecificationInvariantViolation(
        `Unknown Specification priority: ${priority}`,
      );
    }
  },
};

export const VersionPolicy = {
  assertUniqueVersionLabel(
    existingLabels: readonly string[],
    next: SpecificationVersion,
  ): void {
    if (existingLabels.includes(next.label)) {
      throw new TestSpecificationInvariantViolation(
        `Specification version ${next.label} is not unique`,
      );
    }
  },
  assertBump(
    current: SpecificationVersion,
    next: SpecificationVersion,
    bump: "major" | "minor",
  ): void {
    if (bump === "major") {
      if (next.major !== current.major + 1 || next.minor !== 0) {
        throw new TestSpecificationInvariantViolation(
          "Major version bump must increment major and reset minor to 0",
        );
      }
      return;
    }
    if (next.major !== current.major || next.minor !== current.minor + 1) {
      throw new TestSpecificationInvariantViolation(
        "Minor version bump must increment minor within the same major",
      );
    }
  },
  assertOnlyOneAuthoritative(isAuthoritative: boolean, status: SpecificationStatus): void {
    LifecyclePolicy.assertAuthoritativeOnlyWhenApproved(status, isAuthoritative);
  },
};

export const ClassificationPolicy = {
  assertPresent(classification: string | undefined): void {
    if (!classification?.trim()) {
      throw new TestSpecificationInvariantViolation(
        "Specification classification is required",
      );
    }
  },
};

export const RiskPolicy = {
  assertRiskIdentity(id: string, summary: string): void {
    if (!id.trim() || !summary.trim()) {
      throw new TestSpecificationInvariantViolation(
        "Specification risk requires id and summary",
      );
    }
  },
};

export const DependencyPolicy = {
  assertDependencyIdentity(id: string, summary: string): void {
    if (!id.trim() || !summary.trim()) {
      throw new TestSpecificationInvariantViolation(
        "Specification dependency requires id and summary",
      );
    }
  },
};

export const SupersessionPolicy = {
  assertCanSupersede(status: SpecificationStatus): void {
    if (status !== "approved") {
      throw new TestSpecificationInvariantViolation(
        "Only Approved Specifications may be superseded",
      );
    }
  },
  assertNotSelf(selfId: SpecificationId, successorId: SpecificationId): void {
    if (selfId === successorId) {
      throw new TestSpecificationInvariantViolation(
        "Specification cannot supersede itself",
      );
    }
  },
};

export const ValidationPolicy = {
  assertRequiredIdentity(input: {
    readonly id?: string;
    readonly title?: string;
    readonly objective?: string;
    readonly owner?: string;
    readonly classification?: string;
  }): void {
    if (!input.id?.trim()) {
      throw new TestSpecificationInvariantViolation("Every Specification has an Identifier");
    }
    if (!input.title?.trim()) {
      throw new TestSpecificationInvariantViolation("Every Specification has a Title");
    }
    if (!input.objective?.trim()) {
      throw new TestSpecificationInvariantViolation("Every Specification has an Objective");
    }
    if (!input.owner?.trim()) {
      throw new TestSpecificationInvariantViolation("Every Specification has an Owner");
    }
    if (!input.classification?.trim()) {
      throw new TestSpecificationInvariantViolation("Every Specification has Classification");
    }
  },
};
