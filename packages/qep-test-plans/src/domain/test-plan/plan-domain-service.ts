import { PlanLineageError } from "../../shared/errors";
import { PLAN_INITIAL_VERSION_LABEL, SUPERSEDE_ELIGIBLE_STATUSES } from "./constants";
import { createEmptyTestPlanHistory } from "./plan-history";
import { createTestPlanAssignment } from "./plan-assignment";
import { clearScheduleDates } from "./plan-schedule";
import type { TestPlan } from "./test-plan";
import { isActiveItem, type TestPlanItem } from "./plan-item";
import type {
  ExecutionReadiness,
  PlanMetrics,
  PlanScope,
  PlanStatus,
} from "./value-objects";
import {
  cloneTitleFromSource,
  createPlanObjective,
  createPlanScope,
  createPlanTitle,
  createPriority,
  isScopeValid,
  nextSealedVersionLabel,
} from "./value-objects";

export type ReadinessEvaluationContext = "markReady" | "startExecution";

export type PlanReadinessInput = {
  readonly status: PlanStatus;
  readonly title: string;
  readonly objective: string;
  readonly scope: PlanScope;
  readonly items: readonly TestPlanItem[];
  readonly context: ReadinessEvaluationContext;
};

export const PlanReadinessService = {
  evaluate(input: PlanReadinessInput): ExecutionReadiness {
    const reasons: string[] = [];

    if (input.context === "markReady" && input.status !== "approved") {
      reasons.push("NOT_APPROVED");
    }
    if (input.context === "startExecution" && input.status !== "ready") {
      reasons.push("NOT_APPROVED");
    }

    if (!input.title.trim()) {
      reasons.push("TITLE_MISSING");
    }
    if (!input.objective.trim()) {
      reasons.push("OBJECTIVE_MISSING");
    }
    if (!isScopeValid(input.scope)) {
      reasons.push("HAS_INVALID_CUSTOM_SCOPE");
    }

    const includedItems = input.items.filter(
      (item) => isActiveItem(item) && item.itemStatus === "included",
    );
    if (includedItems.length === 0) {
      reasons.push("NO_INCLUDED_ITEMS");
    } else {
      for (const item of includedItems) {
        if (!item.specificationVersionPin?.trim()) {
          reasons.push("MISSING_VERSION_PIN");
          break;
        }
      }
    }

    return {
      ready: reasons.length === 0,
      reasons,
    };
  },
};

export const PlanLineageService = {
  assertSupersedeAllowed(plan: TestPlan): void {
    if (
      !SUPERSEDE_ELIGIBLE_STATUSES.includes(
        plan.status as (typeof SUPERSEDE_ELIGIBLE_STATUSES)[number],
      )
    ) {
      throw new PlanLineageError(`Plan in ${plan.status} status cannot be superseded`);
    }
    if (plan.successorPlanId) {
      throw new PlanLineageError(
        "Plan already has a successor and cannot be superseded again",
      );
    }
  },
};

export type BuildDraftFromInput = {
  readonly source: TestPlan;
  readonly id: string;
  readonly number: string;
  readonly actorId: string;
  readonly changedAt: string;
  readonly predecessorPlanId?: string;
  readonly predecessorSealedVersionLabel?: string;
  readonly title?: string;
};

export const PlanCloneService = {
  buildDraftFrom(input: BuildDraftFromInput): Omit<
    TestPlan,
    "uncommittedEvents" | "metrics" | "revision"
  > & {
    readonly revision: 1;
  } {
    const title = createPlanTitle(
      input.title ?? cloneTitleFromSource(input.source.title),
    );
    const items = input.source.items
      .filter((item) => isActiveItem(item))
      .map((item) => ({ ...item }));
    return {
      id: input.id.trim(),
      tenantId: input.source.tenantId,
      number: input.number.trim(),
      revision: 1,
      title,
      ...(input.source.description ? { description: input.source.description } : {}),
      objective: createPlanObjective(input.source.objective || "TBD"),
      scope: createPlanScope(input.source.scope),
      status: "draft",
      priority: createPriority(input.source.priority),
      planType: input.source.scope.class,
      ownerId: input.source.ownerId,
      versionLabel: PLAN_INITIAL_VERSION_LABEL,
      ...(input.predecessorPlanId
        ? { predecessorPlanId: input.predecessorPlanId }
        : {}),
      ...(input.predecessorSealedVersionLabel
        ? { predecessorSealedVersionLabel: input.predecessorSealedVersionLabel }
        : {}),
      createdAt: input.changedAt,
      createdBy: input.actorId,
      updatedAt: input.changedAt,
      updatedBy: input.actorId,
      items,
      schedule: clearScheduleDates(input.source.schedule),
      assignment: createTestPlanAssignment({
        leadId: input.source.assignment.leadId,
        assigneeIds: [...input.source.assignment.assigneeIds],
        updatedAt: input.changedAt,
        updatedBy: input.actorId,
      }),
      approvals: [],
      revisions: [],
      history: createEmptyTestPlanHistory(),
      ...(input.source.metadata ? { metadata: { ...input.source.metadata } } : {}),
      ...(input.source.externalReferences
        ? { externalReferences: [...input.source.externalReferences] }
        : {}),
    };
  },
};

export const PlanMetricsCalculator = {
  recompute(items: readonly TestPlanItem[]): PlanMetrics {
    const active = items.filter((item) => isActiveItem(item));
    const included = active.filter((item) => item.itemStatus === "included");
    return {
      totalItems: active.length,
      includedCount: included.length,
      optionalCount: active.filter((item) => item.itemStatus === "optional").length,
      deferredCount: active.filter((item) => item.itemStatus === "deferred").length,
      pinnedIncludedCount: included.filter((item) =>
        Boolean(item.specificationVersionPin?.trim()),
      ).length,
    };
  },
};

export function resolveSealVersionLabel(plan: TestPlan): string {
  const latestSealed = plan.revisions.at(-1)?.versionLabel;
  if (latestSealed) {
    return nextSealedVersionLabel(latestSealed);
  }
  if (plan.predecessorSealedVersionLabel) {
    return nextSealedVersionLabel(plan.predecessorSealedVersionLabel);
  }
  return nextSealedVersionLabel(undefined);
}
