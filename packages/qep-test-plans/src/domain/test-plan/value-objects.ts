import { PlanValidationError } from "../../shared/errors";
import {
  PLAN_DESCRIPTION_MAX,
  PLAN_NOTES_MAX,
  PLAN_NUMBER_MAX,
  PLAN_OBJECTIVE_MAX,
  PLAN_PRIORITIES,
  PLAN_STATUSES,
  PLAN_TITLE_MAX,
  PLAN_TYPES,
  type PLAN_ITEM_STATUSES,
} from "./constants";

export type PlanStatus = (typeof PLAN_STATUSES)[number];
export type PlanType = (typeof PLAN_TYPES)[number];
export type Priority = (typeof PLAN_PRIORITIES)[number];
export type PlanItemStatus = (typeof PLAN_ITEM_STATUSES)[number];
export type ApprovalState = "none" | "pending_review" | "approved" | "rejected";

export type ActorId = string;
export type TenantId = string;
export type SpecificationId = string;
export type RequirementId = string;
export type VerificationSubjectId = string;

export type PlanScope = {
  readonly class: PlanType;
  readonly label?: string;
  readonly externalRef?: string;
};

export type ExecutionWindow = {
  readonly plannedStart?: string;
  readonly plannedEnd?: string;
};

export type VersionReference = {
  readonly planId: string;
  readonly versionLabel: string;
};

export type PlanMetrics = {
  readonly totalItems: number;
  readonly includedCount: number;
  readonly optionalCount: number;
  readonly deferredCount: number;
  readonly pinnedIncludedCount: number;
};

export type ExecutionReadiness = {
  readonly ready: boolean;
  readonly reasons: readonly string[];
};

function assertNonEmpty(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new PlanValidationError(`${field} must be non-empty`);
  }
  return trimmed;
}

function assertMaxLength(value: string, max: number, field: string): string {
  if (value.length > max) {
    throw new PlanValidationError(`${field} exceeds maximum length of ${max}`);
  }
  return value;
}

export function createPlanStatus(value: string): PlanStatus {
  const normalized = value.trim() as PlanStatus;
  if (!PLAN_STATUSES.includes(normalized)) {
    throw new PlanValidationError(`Invalid plan status: ${value}`);
  }
  return normalized;
}

export function createPlanType(value: string): PlanType {
  const normalized = value.trim() as PlanType;
  if (!PLAN_TYPES.includes(normalized)) {
    throw new PlanValidationError(`Invalid plan type: ${value}`);
  }
  return normalized;
}

export function createPriority(value?: string): Priority {
  const normalized = (value?.trim() ?? "medium") as Priority;
  if (!PLAN_PRIORITIES.includes(normalized)) {
    throw new PlanValidationError(`Invalid priority: ${value}`);
  }
  return normalized;
}

export function createPlanScope(input: {
  readonly class: string;
  readonly label?: string;
  readonly externalRef?: string;
}): PlanScope {
  const planClass = createPlanType(input.class);
  const label = input.label?.trim();
  const externalRef = input.externalRef?.trim();
  if (planClass === "custom" && !label) {
    throw new PlanValidationError("Custom plan scope requires a label");
  }
  return {
    class: planClass,
    ...(label ? { label } : {}),
    ...(externalRef ? { externalRef } : {}),
  };
}

export function createPlanTitle(value: string): string {
  return assertMaxLength(assertNonEmpty(value, "title"), PLAN_TITLE_MAX, "title");
}

export function createPlanDescription(value?: string): string | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }
  return assertMaxLength(value.trim(), PLAN_DESCRIPTION_MAX, "description");
}

export function createPlanObjective(value: string): string {
  return assertMaxLength(
    assertNonEmpty(value, "objective"),
    PLAN_OBJECTIVE_MAX,
    "objective",
  );
}

export function createPlanNumber(value: string): string {
  const trimmed = assertNonEmpty(value, "number");
  if (trimmed.length > PLAN_NUMBER_MAX) {
    throw new PlanValidationError(
      `number exceeds maximum length of ${PLAN_NUMBER_MAX}`,
    );
  }
  if (!/^[A-Za-z0-9._-]+$/.test(trimmed)) {
    throw new PlanValidationError(
      "number must contain only alphanumeric characters, dots, underscores, or hyphens",
    );
  }
  return trimmed;
}

export function createPlanNotes(value?: string): string | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }
  return assertMaxLength(value.trim(), PLAN_NOTES_MAX, "notes");
}

export function createActorId(value: string): ActorId {
  return assertNonEmpty(value, "actorId");
}

export function createTenantId(value: string): TenantId {
  return assertNonEmpty(value, "tenantId");
}

export function createSpecificationId(value: string): SpecificationId {
  return assertNonEmpty(value, "specificationId");
}

export function createRequirementId(value: string): RequirementId {
  return assertNonEmpty(value, "requirementId");
}

export function createExecutionWindow(input: ExecutionWindow): ExecutionWindow {
  const plannedStart = input.plannedStart?.trim();
  const plannedEnd = input.plannedEnd?.trim();
  if (plannedStart && plannedEnd && plannedEnd < plannedStart) {
    throw new PlanValidationError(
      "plannedEnd must be greater than or equal to plannedStart",
    );
  }
  return {
    ...(plannedStart ? { plannedStart } : {}),
    ...(plannedEnd ? { plannedEnd } : {}),
  };
}

export function createVersionReference(input: VersionReference): VersionReference {
  return {
    planId: assertNonEmpty(input.planId, "planId"),
    versionLabel: assertNonEmpty(input.versionLabel, "versionLabel"),
  };
}

export function isScopeValid(scope: PlanScope): boolean {
  if (scope.class === "custom") {
    return Boolean(scope.label?.trim());
  }
  return true;
}

export function deriveApprovalState(
  status: PlanStatus,
  approvals: readonly { readonly decision: "approved" | "rejected" }[],
): ApprovalState {
  if (status === "review") {
    return "pending_review";
  }
  const latest = approvals.at(-1);
  if (!latest) {
    return "none";
  }
  return latest.decision;
}

export function computeItemFingerprint(
  items: readonly {
    readonly id: string;
    readonly itemStatus: PlanItemStatus;
    readonly specificationId: string;
    readonly specificationVersionPin?: string;
  }[],
): string {
  const active = items
    .filter((item) => item.itemStatus !== "removed")
    .map(
      (item) =>
        `${item.specificationId}:${item.specificationVersionPin ?? ""}:${item.itemStatus}`,
    )
    .sort()
    .join("|");
  return `${active.split("|").filter(Boolean).length}:${active}`;
}

export function nextSealedVersionLabel(predecessorSealedLabel?: string): string {
  if (!predecessorSealedLabel) {
    return "1.0";
  }
  const major = Number.parseInt(predecessorSealedLabel.split(".")[0] ?? "0", 10);
  if (Number.isNaN(major)) {
    return "1.0";
  }
  return `${major + 1}.0`;
}

export function cloneTitleFromSource(title: string): string {
  const trimmed = title.trim();
  if (trimmed.startsWith("Copy of ")) {
    return trimmed;
  }
  return `Copy of ${trimmed}`;
}
