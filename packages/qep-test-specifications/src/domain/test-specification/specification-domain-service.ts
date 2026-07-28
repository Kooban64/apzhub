import {
  assertSpecificationLifecycleTransition,
  canTransitionSpecificationStatus,
  getAllowedSpecificationTransitions,
  isTerminalSpecificationStatus,
} from "./lifecycle-state";
import type { SpecificationStatus } from "./specification-status";
import type { SpecificationRecord } from "./specification-record";
import type { SpecificationVersion } from "./value-objects";
import { createSpecificationVersion } from "./value-objects";
import {
  ApprovalPolicy,
  ClassificationPolicy,
  DependencyPolicy,
  ImmutabilityPolicy,
  LifecyclePolicy,
  OwnershipPolicy,
  PriorityPolicy,
  RelationshipPolicy,
  ReviewPolicy,
  RiskPolicy,
  SupersessionPolicy,
  ValidationPolicy,
  VersionPolicy,
} from "./specification-policy";

/**
 * Pure domain services — no repositories, databases, HTTP, or Platform services.
 */

export const SpecificationLifecycleService = {
  isTerminal: isTerminalSpecificationStatus,
  canTransition: canTransitionSpecificationStatus,
  assertTransition: assertSpecificationLifecycleTransition,
  allowedTransitions: getAllowedSpecificationTransitions,
};

export const SpecificationValidationService = {
  validateCreateInput(input: {
    readonly id?: string;
    readonly title?: string;
    readonly objective?: string;
    readonly owner?: string;
    readonly classification?: string;
  }): void {
    ValidationPolicy.assertRequiredIdentity(input);
    OwnershipPolicy.assertOwnerPresent(input.owner);
    ClassificationPolicy.assertPresent(input.classification);
  },
  assertEditable(status: SpecificationStatus): void {
    LifecyclePolicy.assertEditable(status);
    ImmutabilityPolicy.assertMutable(status);
  },
};

export const SpecificationApprovalService = {
  assertCanApprove: ApprovalPolicy.assertCanApprove,
  assertCanReject: ApprovalPolicy.assertCanReject,
  assertCanStartReview: ReviewPolicy.assertCanStartReview,
  assertReviewerPresent: ReviewPolicy.assertReviewerPresent,
};

export const SpecificationRelationshipService = {
  assertNotSelf: RelationshipPolicy.assertNotSelf,
  assertReferencePresent: RelationshipPolicy.assertReferencePresent,
};

export const SpecificationVersionService = {
  bump(current: SpecificationVersion, bump: "major" | "minor"): SpecificationVersion {
    const next =
      bump === "major"
        ? createSpecificationVersion(current.major + 1, 0)
        : createSpecificationVersion(current.major, current.minor + 1);
    VersionPolicy.assertBump(current, next, bump);
    return next;
  },
  assertUnique(existingLabels: readonly string[], next: SpecificationVersion): void {
    VersionPolicy.assertUniqueVersionLabel(existingLabels, next);
  },
  assertAuthoritative(record: SpecificationRecord): void {
    VersionPolicy.assertOnlyOneAuthoritative(record.isAuthoritative, record.status);
  },
  latestApprovedLabel(records: readonly SpecificationRecord[]): string | undefined {
    const approved = records.filter((r) => r.status === "approved" && r.isAuthoritative);
    if (approved.length === 0) return undefined;
    return approved
      .map((r) => r.version)
      .sort((a, b) => a.major - b.major || a.minor - b.minor)
      .at(-1)?.label;
  },
};

export const SpecificationPolicyService = {
  runCreatePolicies(input: {
    readonly id?: string;
    readonly title?: string;
    readonly objective?: string;
    readonly owner?: string;
    readonly classification?: string;
  }): void {
    SpecificationValidationService.validateCreateInput(input);
  },
  runEditPolicies(status: SpecificationStatus): void {
    SpecificationValidationService.assertEditable(status);
  },
  runApprovePolicies(status: SpecificationStatus): void {
    ApprovalPolicy.assertCanApprove(status);
  },
  runRejectPolicies(status: SpecificationStatus): void {
    ApprovalPolicy.assertCanReject(status);
  },
  runSupersedePolicies(
    status: SpecificationStatus,
    selfId: string,
    successorId: string,
  ): void {
    SupersessionPolicy.assertCanSupersede(status);
    SupersessionPolicy.assertNotSelf(selfId as never, successorId as never);
  },
  runPriorityPolicy: PriorityPolicy.assertKnownPriority,
  runRiskPolicy: RiskPolicy.assertRiskIdentity,
  runDependencyPolicy: DependencyPolicy.assertDependencyIdentity,
  LifecyclePolicy,
  ApprovalPolicy,
  ReviewPolicy,
  OwnershipPolicy,
  RelationshipPolicy,
  PriorityPolicy,
  VersionPolicy,
  ClassificationPolicy,
  RiskPolicy,
  DependencyPolicy,
  ImmutabilityPolicy,
  SupersessionPolicy,
  ValidationPolicy,
};
