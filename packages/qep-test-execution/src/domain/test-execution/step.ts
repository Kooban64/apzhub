import { ExecutionNotFoundError, ExecutionValidationError } from "../../shared/errors";
import type { ManifestStepSnapshot } from "./manifest";
import type { StepOutcome } from "./value-objects";
import { createExecutionText, createStepOutcome } from "./value-objects";

export type ExecutionStep = {
  readonly order: number;
  readonly instruction: string;
  readonly expectedResult: string;
  readonly preconditions: readonly string[];
  readonly requireActualResult: boolean;
  readonly allowUnordered: boolean;
  readonly actualResult?: string;
  readonly outcome?: StepOutcome;
  readonly evidenceIds: readonly string[];
  readonly skipReason?: string;
  readonly blockReason?: string;
  readonly notApplicableReason?: string;
  readonly comment?: string;
  readonly attemptCount: number;
  readonly startedAt?: string;
  readonly completedAt?: string;
};

export function createExecutionStepsFromManifest(
  snapshots: readonly ManifestStepSnapshot[],
): readonly ExecutionStep[] {
  return [...snapshots]
    .sort((a, b) => a.order - b.order)
    .map((snapshot) => ({
      order: snapshot.order,
      instruction: snapshot.instruction,
      expectedResult: snapshot.expectedResult,
      preconditions: [...snapshot.preconditions],
      requireActualResult: snapshot.requireActualResult,
      allowUnordered: snapshot.allowUnordered,
      evidenceIds: [],
      attemptCount: 0,
    }));
}

export function findExecutionStep(
  steps: readonly ExecutionStep[],
  order: number,
): ExecutionStep {
  const step = steps.find((candidate) => candidate.order === order);
  if (!step) {
    throw new ExecutionNotFoundError(`Execution step ${order} not found`);
  }
  return step;
}

export type RecordStepResultInput = {
  readonly order: number;
  readonly outcome: string;
  readonly actualResult?: string;
  readonly skipReason?: string;
  readonly blockReason?: string;
  readonly notApplicableReason?: string;
  readonly comment?: string;
  readonly evidenceIds?: readonly string[];
  readonly startedAt?: string;
  readonly completedAt?: string;
};

export function applyStepResult(
  step: ExecutionStep,
  input: RecordStepResultInput,
  changedAt: string,
): ExecutionStep {
  const outcome = createStepOutcome(input.outcome);
  if (outcome === "skipped" && !input.skipReason?.trim()) {
    throw new ExecutionValidationError(
      "skipReason is required when outcome is skipped",
    );
  }
  if (outcome === "blocked" && !input.blockReason?.trim()) {
    throw new ExecutionValidationError(
      "blockReason is required when outcome is blocked",
    );
  }
  if (outcome === "not_applicable" && !input.notApplicableReason?.trim()) {
    throw new ExecutionValidationError(
      "notApplicableReason is required when outcome is not_applicable",
    );
  }
  const actualResult =
    input.actualResult !== undefined
      ? createExecutionText(input.actualResult, "actualResult")
      : step.actualResult;
  const attemptCount = step.attemptCount === 0 ? 1 : step.attemptCount;
  return {
    ...step,
    outcome,
    ...(actualResult !== undefined ? { actualResult } : {}),
    ...(input.skipReason?.trim() ? { skipReason: input.skipReason.trim() } : {}),
    ...(input.blockReason?.trim() ? { blockReason: input.blockReason.trim() } : {}),
    ...(input.notApplicableReason?.trim()
      ? { notApplicableReason: input.notApplicableReason.trim() }
      : {}),
    ...(input.comment?.trim()
      ? { comment: createExecutionText(input.comment, "comment") }
      : {}),
    evidenceIds: [...(input.evidenceIds ?? step.evidenceIds)],
    attemptCount,
    startedAt: input.startedAt ?? step.startedAt ?? changedAt,
    completedAt: input.completedAt ?? changedAt,
  };
}

export function updateSteps(
  steps: readonly ExecutionStep[],
  order: number,
  updater: (step: ExecutionStep) => ExecutionStep,
): readonly ExecutionStep[] {
  return steps.map((step) => (step.order === order ? updater(step) : step));
}

export function everyStepHasOutcome(steps: readonly ExecutionStep[]): boolean {
  return steps.length > 0 && steps.every((step) => step.outcome !== undefined);
}

export function stepOutcomes(steps: readonly ExecutionStep[]): readonly StepOutcome[] {
  return steps
    .map((step) => step.outcome)
    .filter((outcome): outcome is StepOutcome => outcome !== undefined);
}
