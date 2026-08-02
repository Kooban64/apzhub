/**
 * Lifecycle transition policy evaluator — APZQEP-120-S06.
 */

import type { Evidence } from "../../domain/evidence";
import {
  deriveCatalogueState,
  normaliseCatalogueState,
} from "../../domain/evidence/catalogue-state";
import type { LifecycleGovernanceState } from "../../domain/evidence/lifecycle-governance";
import type { EvidencePermission } from "../../shared/contracts";
import {
  findTransitionEdge,
  type LifecycleTransitionAction,
  type LifecycleTransitionEdge,
} from "./transition-matrix";

export type LifecyclePolicyDecision = {
  readonly allowed: boolean;
  readonly sourceState: LifecycleGovernanceState;
  readonly targetState?: LifecycleGovernanceState;
  readonly reasonCode: string;
  readonly requiredPermission?: EvidencePermission;
  readonly failedConditions: readonly string[];
  readonly warnings: readonly string[];
  readonly edge?: LifecycleTransitionEdge;
};

export function resolveLifecycleState(evidence: Evidence): LifecycleGovernanceState {
  if (evidence.lifecycleGovernance?.state) {
    return evidence.lifecycleGovernance.state;
  }
  return normaliseCatalogueState(deriveCatalogueState(evidence));
}

export function evaluateLifecycleTransition(input: {
  readonly evidence: Evidence;
  readonly action: LifecycleTransitionAction;
  readonly actorPermissions: readonly string[];
  readonly reason?: string;
  readonly successorEvidenceId?: string;
  readonly contentExists?: boolean;
}): LifecyclePolicyDecision {
  const sourceState = resolveLifecycleState(input.evidence);
  const edge = findTransitionEdge(input.action, sourceState);
  const failed: string[] = [];
  const warnings: string[] = [];

  if (!edge) {
    return {
      allowed: false,
      sourceState,
      reasonCode: "LIFECYCLE_TRANSITION_INVALID",
      failedConditions: [`No transition ${input.action} from ${sourceState}`],
      warnings,
    };
  }

  if (sourceState === edge.to) {
    return {
      allowed: false,
      sourceState,
      targetState: edge.to,
      reasonCode: "LIFECYCLE_ALREADY_IN_TARGET_STATE",
      requiredPermission: edge.permissions[0],
      failedConditions: [`Already in state ${edge.to}`],
      warnings,
      edge,
    };
  }

  const hasPermission = edge.permissions.some((p) =>
    input.actorPermissions.includes(p),
  );
  if (!hasPermission) {
    failed.push("missing_permission");
  }

  if (edge.reasonRequired && (!input.reason || input.reason.trim().length < 3)) {
    failed.push("reason_required");
  }

  const holdStatus =
    input.evidence.lifecycleGovernance?.holdStatus ??
    (input.evidence.retention.legalHold ? "HELD" : "NOT_HELD");
  if (edge.blockedWhenHeld && holdStatus === "HELD") {
    failed.push("hold_active");
  }
  if (edge.blockedWhenHeld && input.evidence.retention.legalHold) {
    failed.push("hold_active");
  }

  if (edge.requiresIntegrityEstablished) {
    if (!input.evidence.integrity?.contentHash) {
      failed.push("integrity_not_established");
    }
  }

  if (input.action === "markSuperseded") {
    if (!input.successorEvidenceId?.trim()) {
      failed.push("successor_required");
    } else if (input.successorEvidenceId === input.evidence.id) {
      failed.push("supersession_self");
    }
  }

  if (
    input.contentExists === false &&
    (input.action === "markArchived" || input.action === "markArchiveEligible")
  ) {
    warnings.push("content_missing_at_evaluation");
  }

  if (failed.includes("missing_permission")) {
    return {
      allowed: false,
      sourceState,
      targetState: edge.to,
      reasonCode: "LIFECYCLE_TRANSITION_FORBIDDEN",
      requiredPermission: edge.permissions[0],
      failedConditions: [...new Set(failed)],
      warnings,
      edge,
    };
  }
  if (failed.includes("hold_active")) {
    return {
      allowed: false,
      sourceState,
      targetState: edge.to,
      reasonCode: "LIFECYCLE_HOLD_ACTIVE",
      requiredPermission: edge.permissions[0],
      failedConditions: [...new Set(failed)],
      warnings,
      edge,
    };
  }
  if (failed.includes("reason_required")) {
    return {
      allowed: false,
      sourceState,
      targetState: edge.to,
      reasonCode: "LIFECYCLE_REASON_REQUIRED",
      requiredPermission: edge.permissions[0],
      failedConditions: [...new Set(failed)],
      warnings,
      edge,
    };
  }
  if (failed.includes("integrity_not_established")) {
    return {
      allowed: false,
      sourceState,
      targetState: edge.to,
      reasonCode: "LIFECYCLE_INTEGRITY_REQUIREMENT_FAILED",
      requiredPermission: edge.permissions[0],
      failedConditions: [...new Set(failed)],
      warnings,
      edge,
    };
  }
  if (failed.length > 0) {
    return {
      allowed: false,
      sourceState,
      targetState: edge.to,
      reasonCode: "LIFECYCLE_TRANSITION_INVALID",
      requiredPermission: edge.permissions[0],
      failedConditions: [...new Set(failed)],
      warnings,
      edge,
    };
  }

  return {
    allowed: true,
    sourceState,
    targetState: edge.to,
    reasonCode: "ALLOWED",
    requiredPermission: edge.permissions[0],
    failedConditions: [],
    warnings,
    edge,
  };
}
