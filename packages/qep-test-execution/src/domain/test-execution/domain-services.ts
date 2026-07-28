import { ExecutionConflictError } from "../../shared/errors";
import { createSealedManifest, type ResolvedManifestInput } from "./manifest";
import { OutcomeDerivationPolicy } from "./policies";
import type { ExecutionStep } from "./step";
import { stepOutcomes } from "./step";
import type { ExternalExecutionSubmission } from "./external-submission";
import { submissionKey } from "./external-submission";
import type {
  ExecutionOutcome,
  ExecutionSourceRefs,
  StepOutcome,
} from "./value-objects";
import { createExecutionOutcome } from "./value-objects";

export function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export const ManifestSealer = {
  seal(input: {
    readonly resolved: ResolvedManifestInput;
    readonly sealedAt: string;
    readonly sealedBy: string;
    readonly sourceRefs: ExecutionSourceRefs;
  }) {
    const canonical = JSON.stringify({
      sourceRefs: input.sourceRefs,
      steps: input.resolved.steps,
      preconditions: input.resolved.preconditions ?? [],
    });
    const contentHash = fnv1aHash(canonical);
    const manifest = createSealedManifest({
      resolved: {
        ...input.resolved,
        sourceRefs: input.sourceRefs,
      },
      sourceRefs: input.sourceRefs,
      sealedAt: input.sealedAt,
      sealedBy: input.sealedBy,
      contentHash,
    });
    return { manifest, contentHash };
  },
};

const PASS_LIKE: readonly StepOutcome[] = [
  "passed",
  "skipped",
  "not_applicable",
  "not_executed",
];

export const OutcomeDeriver = {
  deriveFromSteps(steps: readonly Pick<ExecutionStep, "outcome">[]): ExecutionOutcome {
    const outcomes = stepOutcomes(
      steps.map((step, index) => ({
        order: index,
        instruction: "",
        expectedResult: "",
        preconditions: [],
        requireActualResult: true,
        allowUnordered: false,
        evidenceIds: [],
        attemptCount: 0,
        outcome: step.outcome,
      })),
    );
    if (outcomes.length === 0) {
      return createExecutionOutcome("inconclusive");
    }

    for (const precedence of OutcomeDerivationPolicy.precedence) {
      if (outcomes.includes(precedence)) {
        return createExecutionOutcome(precedence);
      }
    }

    const allPassLike = outcomes.every((outcome) => PASS_LIKE.includes(outcome));
    if (allPassLike) {
      const onlyNotExecuted = outcomes.every((outcome) => outcome === "not_executed");
      if (onlyNotExecuted) {
        return createExecutionOutcome("inconclusive");
      }
      return createExecutionOutcome("passed");
    }

    return createExecutionOutcome("inconclusive");
  },
};

export type IngestionCorrelationInput = {
  readonly tenantId: string;
  readonly sourceSystemId: string;
  readonly idempotencyKey: string;
  readonly existingSubmissions: readonly ExternalExecutionSubmission[];
};

export const IngestionCorrelator = {
  assertUnique(input: IngestionCorrelationInput): void {
    const duplicate = input.existingSubmissions.find(
      (submission) =>
        submissionKey(submission.sourceSystemId, submission.idempotencyKey) ===
        submissionKey(input.sourceSystemId, input.idempotencyKey),
    );
    if (duplicate) {
      throw new ExecutionConflictError(
        "Duplicate ingestion idempotency key for tenant and source system",
        {
          tenantId: input.tenantId,
          sourceSystemId: input.sourceSystemId,
          idempotencyKey: input.idempotencyKey,
        },
      );
    }
  },

  isReplay(
    submissions: readonly ExternalExecutionSubmission[],
    sourceSystemId: string,
    idempotencyKey: string,
  ): ExternalExecutionSubmission | undefined {
    return submissions.find(
      (submission) =>
        submission.sourceSystemId === sourceSystemId &&
        submission.idempotencyKey === idempotencyKey,
    );
  },
};

export { ExecutionHistoryRecorder } from "./history";
