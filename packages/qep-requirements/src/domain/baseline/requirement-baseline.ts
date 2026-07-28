import { QepInvariantViolation } from "../../shared/errors";
import {
  assertRequirementBaselineDraftMutable,
  assertRequirementBaselineTransition,
  assertUniqueRequirementBaselineMembership,
} from "./requirement-baseline-policy";
import {
  createRequirementBaselineDescription,
  type RequirementBaselineDescription,
} from "./requirement-baseline-description";
import {
  createRequirementBaselineId,
  type RequirementBaselineId,
} from "./requirement-baseline-id";
import {
  computeBaselineIntegrityFingerprint,
  type RequirementBaselineIntegrityMembershipInput,
  type RequirementBaselineIntegrityVerificationStatus,
} from "./requirement-baseline-integrity";
import {
  createRequirementBaselineName,
  type RequirementBaselineName,
} from "./requirement-baseline-name";
import {
  createRequirementBaselineNumber,
  type RequirementBaselineNumber,
} from "./requirement-baseline-number";
import type { RequirementBaselineItem } from "./requirement-baseline-item";
import type { RequirementBaselineStatus } from "./requirement-baseline-status";
import { QepBaselineInvalidStateError } from "../../shared/errors";

export type RequirementBaseline = {
  readonly id: RequirementBaselineId;
  readonly tenantId: string;
  readonly number: RequirementBaselineNumber;
  readonly name: RequirementBaselineName;
  readonly description?: RequirementBaselineDescription;
  readonly status: RequirementBaselineStatus;
  readonly items: readonly RequirementBaselineItem[];
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly correlationId: string;
  readonly integrityFingerprint?: string;
  readonly integrityAlgorithm?: string;
  readonly integritySchemaVersion?: string;
  readonly integrityVerificationStatus?: RequirementBaselineIntegrityVerificationStatus;
  readonly integrityVerifiedAt?: string;
  readonly lockedAt?: string;
  readonly lockedBy?: string;
  readonly archivedAt?: string;
  readonly archivedBy?: string;
};

export type CreateRequirementBaselineInput = {
  readonly id: string;
  readonly tenantId: string;
  readonly number: number;
  readonly name: string;
  readonly description?: string;
  readonly items?: readonly RequirementBaselineItem[];
  readonly createdAt: string;
  readonly createdBy: string;
  readonly correlationId: string;
};

/**
 * Configuration-management aggregate, distinct from the lightweight
 * RequirementBaselineReference field retained on mutable Requirement content.
 * Creates a new aggregate exclusively in its initial draft state.
 */
export function createRequirementBaseline(
  input: CreateRequirementBaselineInput,
): RequirementBaseline {
  const tenantId = input.tenantId.trim();
  const createdAt = input.createdAt.trim();
  const createdBy = input.createdBy.trim();
  const correlationId = input.correlationId.trim();
  if (!tenantId || !createdAt || !createdBy || !correlationId) {
    throw new QepInvariantViolation(
      "Requirement baseline requires tenantId, createdAt, createdBy, and correlationId",
    );
  }
  const items = [...(input.items ?? [])];
  assertUniqueRequirementBaselineMembership(items);

  return {
    id: createRequirementBaselineId(input.id),
    tenantId,
    number: createRequirementBaselineNumber(input.number),
    name: createRequirementBaselineName(input.name),
    ...(input.description !== undefined
      ? { description: createRequirementBaselineDescription(input.description) }
      : {}),
    status: "draft",
    items,
    createdAt,
    createdBy,
    updatedAt: createdAt,
    updatedBy: createdBy,
    correlationId,
  };
}

export function addRequirementBaselineItem(
  baseline: RequirementBaseline,
  item: RequirementBaselineItem,
  changedAt: string,
  changedBy: string,
): RequirementBaseline {
  assertRequirementBaselineDraftMutable(baseline);
  const items = [...baseline.items, item];
  assertUniqueRequirementBaselineMembership(items);
  return withDraftChange(baseline, { items }, changedAt, changedBy);
}

export function removeRequirementBaselineItem(
  baseline: RequirementBaseline,
  contentVersionId: string,
  changedAt: string,
  changedBy: string,
): RequirementBaseline {
  assertRequirementBaselineDraftMutable(baseline);
  const items = baseline.items.filter((item) => item.contentVersionId !== contentVersionId);
  if (items.length === baseline.items.length) {
    throw new QepInvariantViolation("Baseline item content version was not included");
  }
  return withDraftChange(baseline, { items }, changedAt, changedBy);
}

export function updateRequirementBaselineMetadata(
  baseline: RequirementBaseline,
  input: { readonly name: string; readonly description?: string },
  changedAt: string,
  changedBy: string,
): RequirementBaseline {
  assertRequirementBaselineDraftMutable(baseline);
  return withDraftChange(
    baseline,
    {
      name: createRequirementBaselineName(input.name),
      ...(input.description !== undefined
        ? { description: createRequirementBaselineDescription(input.description) }
        : {}),
    },
    changedAt,
    changedBy,
  );
}

export function assertRequirementBaselineLockEligible(
  baseline: Pick<RequirementBaseline, "status" | "items">,
): void {
  assertRequirementBaselineTransition(baseline.status, "locked");
  if (baseline.items.length === 0) {
    throw new QepBaselineInvalidStateError(
      "A baseline must contain at least one Requirement Content Version before it can be locked",
    );
  }
}

export function transitionRequirementBaseline(
  baseline: RequirementBaseline,
  to: RequirementBaselineStatus,
  changedAt: string,
  changedBy: string,
  membership?: readonly RequirementBaselineIntegrityMembershipInput[],
): RequirementBaseline {
  assertRequirementBaselineTransition(baseline.status, to);
  const actor = changedBy.trim();
  const at = changedAt.trim();
  if (!actor || !at) {
    throw new QepInvariantViolation("Requirement baseline transition requires changedAt and changedBy");
  }
  if (to === "locked") {
    assertRequirementBaselineLockEligible(baseline);
    if (!membership) {
      throw new QepBaselineInvalidStateError(
        "Locking a baseline requires canonical membership integrity inputs",
      );
    }
    const integrity = computeBaselineIntegrityFingerprint({
      baselineId: baseline.id,
      membership,
    });
    return {
      ...baseline,
      status: to,
      updatedAt: at,
      updatedBy: actor,
      lockedAt: at,
      lockedBy: actor,
      integrityFingerprint: integrity.fingerprint,
      integrityAlgorithm: integrity.algorithm,
      integritySchemaVersion: integrity.schemaVersion,
      integrityVerificationStatus: "verified",
      integrityVerifiedAt: at,
    };
  }
  return {
    ...baseline,
    status: to,
    updatedAt: at,
    updatedBy: actor,
    archivedAt: at,
    archivedBy: actor,
  };
}

export function lockRequirementBaseline(
  baseline: RequirementBaseline,
  membership: readonly RequirementBaselineIntegrityMembershipInput[],
  changedAt: string,
  changedBy: string,
): RequirementBaseline {
  return transitionRequirementBaseline(baseline, "locked", changedAt, changedBy, membership);
}

export function archiveRequirementBaseline(
  baseline: RequirementBaseline,
  changedAt: string,
  changedBy: string,
): RequirementBaseline {
  return transitionRequirementBaseline(baseline, "archived", changedAt, changedBy);
}

function withDraftChange(
  baseline: RequirementBaseline,
  change: Partial<Pick<RequirementBaseline, "name" | "description" | "items">>,
  changedAt: string,
  changedBy: string,
): RequirementBaseline {
  const actor = changedBy.trim();
  const at = changedAt.trim();
  if (!actor || !at) {
    throw new QepInvariantViolation("Draft baseline change requires changedAt and changedBy");
  }
  return { ...baseline, ...change, updatedAt: at, updatedBy: actor };
}
