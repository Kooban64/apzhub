/**
 * Evidence Lifecycle Platform Service — APZQEP-120-S06.
 * Owns transition policy. Catalogue owns authoritative lifecycle state.
 */

import { applyLifecycleGovernanceTransition } from "../../domain/evidence/evidence";
import { createEvidenceRelationship } from "../../domain/evidence/relationship";
import type { EvidenceLifecycleHistoryRepository } from "../../domain/ports/lifecycle-history";
import type { EvidenceUnitOfWork } from "../../domain/ports/repositories";
import { EvidenceLifecycleError } from "../../shared/lifecycle-errors";
import type { EvidenceRequestContext } from "../context";
import type { ApplicationOrchestrationDeps } from "../orchestration";
import type { EvidenceSecurityGate } from "../security";
import {
  evaluateLifecycleTransition,
  resolveLifecycleState,
  type LifecyclePolicyDecision,
} from "./transition-policy";
import type { LifecycleTransitionAction } from "./transition-matrix";

export type LifecycleStateView = {
  readonly evidenceId: string;
  readonly lifecycleState: string;
  readonly retentionStatus: string;
  readonly holdStatus: string;
  readonly retentionClass?: string;
  readonly retentionUntil?: string;
  readonly archiveEligibleAt?: string;
  readonly archivedAt?: string;
  readonly disposalEligibleAt?: string;
  readonly supersededByEvidenceId?: string;
  readonly revision: number;
};

export type EvidenceLifecyclePlatformService = {
  readonly serviceId: "EvidenceLifecyclePlatformService";
  getLifecycleState(
    ctx: EvidenceRequestContext,
    evidenceId: string,
  ): Promise<LifecycleStateView>;
  getLifecycleHistory(
    ctx: EvidenceRequestContext,
    evidenceId: string,
    page?: { readonly limit?: number; readonly offset?: number },
  ): Promise<{
    readonly items: readonly Record<string, unknown>[];
    readonly total: number;
    readonly limit: number;
    readonly offset: number;
  }>;
  transitionEvidence(
    ctx: EvidenceRequestContext,
    input: {
      readonly evidenceId: string;
      readonly action: LifecycleTransitionAction;
      readonly expectedRevision: number;
      readonly reason?: string;
      readonly successorEvidenceId?: string;
    },
  ): Promise<{
    readonly state: LifecycleStateView;
    readonly decision: LifecyclePolicyDecision;
  }>;
  restrictEvidence(
    ctx: EvidenceRequestContext,
    input: {
      readonly evidenceId: string;
      readonly expectedRevision: number;
      readonly reason: string;
    },
  ): Promise<LifecycleStateView>;
  restoreEvidence(
    ctx: EvidenceRequestContext,
    input: {
      readonly evidenceId: string;
      readonly expectedRevision: number;
    },
  ): Promise<LifecycleStateView>;
  markArchiveEligible(
    ctx: EvidenceRequestContext,
    input: {
      readonly evidenceId: string;
      readonly expectedRevision: number;
    },
  ): Promise<LifecycleStateView>;
  markArchived(
    ctx: EvidenceRequestContext,
    input: {
      readonly evidenceId: string;
      readonly expectedRevision: number;
      readonly reason: string;
    },
  ): Promise<LifecycleStateView>;
  markSuperseded(
    ctx: EvidenceRequestContext,
    input: {
      readonly evidenceId: string;
      readonly expectedRevision: number;
      readonly reason: string;
      readonly successorEvidenceId: string;
    },
  ): Promise<LifecycleStateView>;
  markDisposalEligible(
    ctx: EvidenceRequestContext,
    input: {
      readonly evidenceId: string;
      readonly expectedRevision: number;
      readonly reason: string;
    },
  ): Promise<LifecycleStateView>;
  logicallyDeleteEvidence(
    ctx: EvidenceRequestContext,
    input: {
      readonly evidenceId: string;
      readonly expectedRevision: number;
      readonly reason: string;
    },
  ): Promise<LifecycleStateView>;
};

function toView(
  evidenceId: string,
  evidence: {
    readonly lifecycleGovernance: {
      readonly state: string;
      readonly retentionStatus: string;
      readonly holdStatus: string;
      readonly retentionClass?: string;
      readonly retentionUntil?: string;
      readonly archiveEligibleAt?: string;
      readonly archivedAt?: string;
      readonly disposalEligibleAt?: string;
      readonly supersededByEvidenceId?: string;
    };
    readonly revision: number;
    readonly retention: {
      readonly retentionClass: string;
      readonly retainUntil?: string;
    };
  },
): LifecycleStateView {
  return {
    evidenceId,
    lifecycleState: evidence.lifecycleGovernance.state,
    retentionStatus: evidence.lifecycleGovernance.retentionStatus,
    holdStatus: evidence.lifecycleGovernance.holdStatus,
    retentionClass:
      evidence.lifecycleGovernance.retentionClass ?? evidence.retention.retentionClass,
    retentionUntil:
      evidence.lifecycleGovernance.retentionUntil ?? evidence.retention.retainUntil,
    archiveEligibleAt: evidence.lifecycleGovernance.archiveEligibleAt,
    archivedAt: evidence.lifecycleGovernance.archivedAt,
    disposalEligibleAt: evidence.lifecycleGovernance.disposalEligibleAt,
    supersededByEvidenceId: evidence.lifecycleGovernance.supersededByEvidenceId,
    revision: evidence.revision,
  };
}

export function createEvidenceLifecyclePlatformService(input: {
  readonly deps: ApplicationOrchestrationDeps;
  readonly securityGate: EvidenceSecurityGate;
  readonly lifecycleHistory: EvidenceLifecycleHistoryRepository;
}): EvidenceLifecyclePlatformService {
  const { deps, securityGate, lifecycleHistory } = input;

  async function load(ctx: EvidenceRequestContext, evidenceId: string) {
    const evidence = await deps.uow.evidence.getById(ctx.tenantId, evidenceId);
    if (!evidence) {
      throw new EvidenceLifecycleError(
        "LIFECYCLE_TRANSITION_INVALID",
        "Evidence catalogue record not found",
        { evidenceId },
      );
    }
    return evidence;
  }

  async function runTransition(
    ctx: EvidenceRequestContext,
    params: {
      readonly evidenceId: string;
      readonly action: LifecycleTransitionAction;
      readonly expectedRevision: number;
      readonly reason?: string;
      readonly successorEvidenceId?: string;
    },
  ) {
    await securityGate.authorize(ctx, "getEvidence", {
      evidenceId: params.evidenceId,
    });

    const current = await load(ctx, params.evidenceId);
    if (current.revision !== params.expectedRevision) {
      throw new EvidenceLifecycleError(
        "LIFECYCLE_STALE_REVISION",
        "Stale catalogue revision for lifecycle transition",
        {
          evidenceId: params.evidenceId,
          expectedRevision: params.expectedRevision,
          actualRevision: current.revision,
        },
      );
    }

    let contentExists: boolean | undefined;
    if (current.content?.storageLocator) {
      try {
        contentExists = await deps.storage.exists(
          ctx.tenantId,
          current.content.storageLocator,
        );
      } catch {
        contentExists = false;
      }
    }

    const decision = evaluateLifecycleTransition({
      evidence: current,
      action: params.action,
      actorPermissions: ctx.permissions ?? [],
      reason: params.reason,
      successorEvidenceId: params.successorEvidenceId,
      contentExists,
    });

    if (!decision.allowed || !decision.targetState || !decision.edge) {
      await deps.uow.audit.append({
        id: deps.ids.createId("audit"),
        tenantId: ctx.tenantId,
        evidenceId: params.evidenceId,
        action: `lifecycle.${params.action}.denied`,
        actorId: ctx.userId,
        outcome: "denied",
        correlationId: ctx.correlationId,
        occurredAt: deps.clock.now(),
        details: {
          reasonCode: decision.reasonCode,
          failedConditions: decision.failedConditions,
        },
      });
      throw new EvidenceLifecycleError(
        decision.reasonCode as never,
        `Lifecycle transition denied: ${decision.reasonCode}`,
        {
          sourceState: decision.sourceState,
          targetState: decision.targetState,
          failedConditions: decision.failedConditions,
        },
      );
    }

    if (params.action === "markSuperseded" && params.successorEvidenceId) {
      const successor = await deps.uow.evidence.getById(
        ctx.tenantId,
        params.successorEvidenceId,
      );
      if (!successor) {
        throw new EvidenceLifecycleError(
          "LIFECYCLE_TRANSITION_INVALID",
          "Successor evidence not found in tenant",
          { successorEvidenceId: params.successorEvidenceId },
        );
      }
      if (successor.projectId !== current.projectId) {
        throw new EvidenceLifecycleError(
          "LIFECYCLE_TRANSITION_FORBIDDEN",
          "Cross-project supersession is not permitted",
        );
      }
      // Loop prevention: successor must not already supersede this evidence.
      if (successor.lifecycleGovernance.supersededByEvidenceId === current.id) {
        throw new EvidenceLifecycleError(
          "LIFECYCLE_TRANSITION_INVALID",
          "Supersession loop detected",
        );
      }
    }

    const mutated = applyLifecycleGovernanceTransition(
      current,
      {
        actorId: ctx.userId,
        changedAt: deps.clock.now(),
        expectedRevision: params.expectedRevision,
        correlationId: ctx.correlationId,
      },
      {
        targetState: decision.targetState,
        reason: params.reason,
        successorEvidenceId: params.successorEvidenceId,
      },
    );

    const stored = await deps.uow.evidence.save(mutated, params.expectedRevision);

    if (params.action === "markSuperseded" && params.successorEvidenceId) {
      const relationship = createEvidenceRelationship({
        id: deps.ids.createId("rel"),
        tenantId: ctx.tenantId,
        evidenceId: current.id,
        targetCapability: "evidence",
        targetId: params.successorEvidenceId,
        relationType: "superseded_by",
        createdBy: ctx.userId,
        createdAt: deps.clock.now(),
        correlationId: ctx.correlationId,
      });
      await deps.uow.relationships.save(relationship);

      const successorAfter = await deps.uow.evidence.getById(
        ctx.tenantId,
        params.successorEvidenceId,
      );
      if (successorAfter) {
        // Reverse link only — do not change successor lifecycle state.
        await deps.uow.evidence.save(
          {
            ...successorAfter,
            lifecycleGovernance: {
              ...successorAfter.lifecycleGovernance,
              supersedesEvidenceId: current.id,
            },
            revision: successorAfter.revision + 1,
            updatedAt: deps.clock.now(),
            updatedBy: ctx.userId,
            uncommittedEvents: [],
          },
          successorAfter.revision,
        );
      }
    }

    // Logical archival may mark storage archivedAt without moving bytes.
    if (params.action === "markArchived" && stored.content?.storageLocator) {
      try {
        await deps.storage.archive(ctx.tenantId, stored.content.storageLocator);
      } catch {
        // Storage archive is best-effort for logical ARCHIVED; catalogue state remains.
      }
    }

    const historyId = deps.ids.createId("lch");
    await lifecycleHistory.append({
      id: historyId,
      tenantId: ctx.tenantId,
      evidenceId: stored.id,
      projectId: stored.projectId,
      workspaceId: stored.workspaceId,
      sourceState: decision.sourceState,
      targetState: decision.targetState,
      action: params.action,
      reasonCode: decision.reasonCode,
      reasonText: params.reason,
      actorId: ctx.userId,
      actorType: "user",
      occurredAt: deps.clock.now(),
      correlationId: ctx.correlationId,
      revisionBefore: params.expectedRevision,
      revisionAfter: stored.revision,
      policyDecision: {
        allowed: decision.allowed,
        failedConditions: decision.failedConditions,
        warnings: decision.warnings,
        requiredPermission: decision.requiredPermission,
      },
    });

    await deps.uow.audit.append({
      id: deps.ids.createId("audit"),
      tenantId: ctx.tenantId,
      evidenceId: stored.id,
      action: `lifecycle.${params.action}`,
      actorId: ctx.userId,
      outcome: "allowed",
      correlationId: ctx.correlationId,
      occurredAt: deps.clock.now(),
      details: {
        sourceState: decision.sourceState,
        targetState: decision.targetState,
        historyId,
      },
    });

    return { state: toView(stored.id, stored), decision };
  }

  return {
    serviceId: "EvidenceLifecyclePlatformService",

    async getLifecycleState(ctx, evidenceId) {
      await securityGate.authorize(ctx, "getEvidence", { evidenceId });
      const evidence = await load(ctx, evidenceId);
      // Ensure governance defaults for pre-S06 records.
      const withGov = evidence.lifecycleGovernance
        ? evidence
        : {
            ...evidence,
            lifecycleGovernance: {
              state: resolveLifecycleState(evidence),
              retentionStatus: "NOT_CONFIGURED" as const,
              holdStatus: evidence.retention.legalHold
                ? ("HELD" as const)
                : ("NOT_HELD" as const),
            },
          };
      return toView(evidenceId, withGov);
    },

    async getLifecycleHistory(ctx, evidenceId, page) {
      await securityGate.authorize(ctx, "getAudit", { evidenceId });
      const result = await lifecycleHistory.listByEvidence(
        ctx.tenantId,
        evidenceId,
        page,
      );
      return {
        items: result.items.map((item) => ({
          transitionId: item.id,
          evidenceId: item.evidenceId,
          sourceState: item.sourceState,
          targetState: item.targetState,
          action: item.action,
          reasonCode: item.reasonCode,
          reasonText: item.reasonText,
          actorId: item.actorId,
          occurredAt: item.occurredAt,
          revisionBefore: item.revisionBefore,
          revisionAfter: item.revisionAfter,
        })),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      };
    },

    async transitionEvidence(ctx, input) {
      return runTransition(ctx, input);
    },

    async restrictEvidence(ctx, input) {
      const result = await runTransition(ctx, {
        ...input,
        action: "restrict",
      });
      return result.state;
    },

    async restoreEvidence(ctx, input) {
      const result = await runTransition(ctx, {
        ...input,
        action: "restore",
      });
      return result.state;
    },

    async markArchiveEligible(ctx, input) {
      const result = await runTransition(ctx, {
        ...input,
        action: "markArchiveEligible",
      });
      return result.state;
    },

    async markArchived(ctx, input) {
      const result = await runTransition(ctx, {
        ...input,
        action: "markArchived",
      });
      return result.state;
    },

    async markSuperseded(ctx, input) {
      const result = await runTransition(ctx, {
        ...input,
        action: "markSuperseded",
      });
      return result.state;
    },

    async markDisposalEligible(ctx, input) {
      const result = await runTransition(ctx, {
        ...input,
        action: "markDisposalEligible",
      });
      return result.state;
    },

    async logicallyDeleteEvidence(ctx, input) {
      const result = await runTransition(ctx, {
        ...input,
        action: "logicallyDelete",
      });
      return result.state;
    },
  };
}

/** Exported for tests — unused uow type anchor. */
export type _LifecycleUow = EvidenceUnitOfWork;
