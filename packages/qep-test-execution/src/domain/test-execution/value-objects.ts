import { ExecutionValidationError } from "../../shared/errors";
import {
  EXECUTION_MODES,
  EXECUTION_NUMBER_MAX,
  EXECUTION_OUTCOMES,
  EXECUTION_STATUSES,
  EXECUTION_TEXT_MAX,
  STEP_OUTCOMES,
} from "./constants";

export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];
export type ExecutionMode = (typeof EXECUTION_MODES)[number];
export type StepOutcome = (typeof STEP_OUTCOMES)[number];
export type ExecutionOutcome = (typeof EXECUTION_OUTCOMES)[number];

export type ActorId = string;
export type TenantId = string;
export type PlatformId = string;

export type SourceVersionRef = {
  readonly capability: string;
  readonly id: string;
  readonly versionLabel: string;
};

export type ExecutionSourceRefs = {
  readonly planRef?: SourceVersionRef;
  readonly specRef?: SourceVersionRef;
  readonly planItemId?: string;
};

export type ExecutionContext = {
  readonly descriptors: Readonly<Record<string, string>>;
};

export type ExecutionAssignment = {
  readonly ownerId: string;
  readonly executorId?: string;
  readonly reviewerId?: string;
  readonly agentIdentity?: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type EvidenceReference = {
  readonly id: string;
  readonly uri: string;
  readonly integrityHash?: string;
  readonly associatedAt: string;
  readonly associatedBy: string;
  readonly stepOrder?: number;
};

function assertNonEmpty(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ExecutionValidationError(`${field} must be non-empty`);
  }
  return trimmed;
}

function assertMaxLength(value: string, max: number, field: string): string {
  if (value.length > max) {
    throw new ExecutionValidationError(`${field} exceeds maximum length of ${max}`);
  }
  return value;
}

export function createExecutionStatus(value: string): ExecutionStatus {
  const normalized = value.trim() as ExecutionStatus;
  if (!EXECUTION_STATUSES.includes(normalized)) {
    throw new ExecutionValidationError(`Invalid execution status: ${value}`);
  }
  return normalized;
}

export function createExecutionMode(value: string): ExecutionMode {
  const normalized = value.trim() as ExecutionMode;
  if (!EXECUTION_MODES.includes(normalized)) {
    throw new ExecutionValidationError(`Invalid execution mode: ${value}`);
  }
  return normalized;
}

export function createStepOutcome(value: string): StepOutcome {
  const normalized = value.trim() as StepOutcome;
  if (!STEP_OUTCOMES.includes(normalized)) {
    throw new ExecutionValidationError(`Invalid step outcome: ${value}`);
  }
  return normalized;
}

export function createExecutionOutcome(value: string): ExecutionOutcome {
  const normalized = value.trim() as ExecutionOutcome;
  if (!EXECUTION_OUTCOMES.includes(normalized)) {
    throw new ExecutionValidationError(`Invalid execution outcome: ${value}`);
  }
  return normalized;
}

export function createActorId(value: string): ActorId {
  return assertNonEmpty(value, "actorId");
}

export function createTenantId(value: string): TenantId {
  return assertNonEmpty(value, "tenantId");
}

export function createPlatformId(value: string, field: string): PlatformId {
  return assertNonEmpty(value, field);
}

export function createExecutionNumber(value: string): string {
  const trimmed = assertNonEmpty(value, "executionNumber");
  if (trimmed.length > EXECUTION_NUMBER_MAX) {
    throw new ExecutionValidationError(
      `executionNumber exceeds maximum length of ${EXECUTION_NUMBER_MAX}`,
    );
  }
  if (!/^[A-Za-z0-9._-]+$/.test(trimmed)) {
    throw new ExecutionValidationError(
      "executionNumber must contain only alphanumeric characters, dots, underscores, or hyphens",
    );
  }
  return trimmed;
}

export function createSourceVersionRef(input: {
  readonly capability: string;
  readonly id: string;
  readonly versionLabel: string;
}): SourceVersionRef {
  return {
    capability: assertNonEmpty(input.capability, "capability"),
    id: assertNonEmpty(input.id, "source id"),
    versionLabel: assertNonEmpty(input.versionLabel, "versionLabel"),
  };
}

export function createExecutionSourceRefs(
  input: ExecutionSourceRefs,
): ExecutionSourceRefs {
  if (!input.planRef && !input.specRef) {
    throw new ExecutionValidationError(
      "At least one of planRef or specRef is required",
    );
  }
  return {
    ...(input.planRef ? { planRef: createSourceVersionRef(input.planRef) } : {}),
    ...(input.specRef ? { specRef: createSourceVersionRef(input.specRef) } : {}),
    ...(input.planItemId?.trim()
      ? { planItemId: assertNonEmpty(input.planItemId, "planItemId") }
      : {}),
  };
}

export function createExecutionContext(
  descriptors: Readonly<Record<string, string>> = {},
): ExecutionContext {
  return { descriptors: { ...descriptors } };
}

export function createExecutionAssignment(input: {
  readonly ownerId: string;
  readonly executorId?: string;
  readonly reviewerId?: string;
  readonly agentIdentity?: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
}): ExecutionAssignment {
  return {
    ownerId: createActorId(input.ownerId),
    ...(input.executorId?.trim()
      ? { executorId: createActorId(input.executorId) }
      : {}),
    ...(input.reviewerId?.trim()
      ? { reviewerId: createActorId(input.reviewerId) }
      : {}),
    ...(input.agentIdentity?.trim()
      ? { agentIdentity: assertNonEmpty(input.agentIdentity, "agentIdentity") }
      : {}),
    updatedAt: input.updatedAt.trim(),
    updatedBy: createActorId(input.updatedBy),
  };
}

export function createEvidenceReference(input: {
  readonly id: string;
  readonly uri: string;
  readonly integrityHash?: string;
  readonly associatedAt: string;
  readonly associatedBy: string;
  readonly stepOrder?: number;
}): EvidenceReference {
  const uri = assertNonEmpty(input.uri, "evidence uri");
  return {
    id: assertNonEmpty(input.id, "evidence id"),
    uri,
    ...(input.integrityHash?.trim()
      ? { integrityHash: input.integrityHash.trim() }
      : {}),
    associatedAt: input.associatedAt.trim(),
    associatedBy: createActorId(input.associatedBy),
    ...(input.stepOrder !== undefined ? { stepOrder: input.stepOrder } : {}),
  };
}

export function createExecutionText(value: string, field: string): string {
  return assertMaxLength(assertNonEmpty(value, field), EXECUTION_TEXT_MAX, field);
}

export function mergeExecutionContext(
  current: ExecutionContext,
  patch: Readonly<Record<string, string>>,
): ExecutionContext {
  return { descriptors: { ...current.descriptors, ...patch } };
}
