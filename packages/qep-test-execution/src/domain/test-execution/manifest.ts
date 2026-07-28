import {
  ExecutionConflictError,
  ExecutionPreconditionError,
  ExecutionValidationError,
} from "../../shared/errors";
import type { ExecutionSourceRefs } from "./value-objects";

export type ManifestStepSnapshot = {
  readonly order: number;
  readonly instruction: string;
  readonly expectedResult: string;
  readonly preconditions: readonly string[];
  readonly requireActualResult: boolean;
  readonly allowUnordered: boolean;
};

export type ExecutionManifest = {
  readonly sourceRefs: ExecutionSourceRefs;
  readonly steps: readonly ManifestStepSnapshot[];
  readonly preconditions: readonly string[];
  readonly sealedAt: string;
  readonly sealedBy: string;
  readonly contentHash: string;
};

export type ResolvedManifestInput = {
  readonly sourceRefs?: ExecutionSourceRefs;
  readonly steps: readonly {
    readonly order: number;
    readonly instruction: string;
    readonly expectedResult: string;
    readonly preconditions?: readonly string[];
    readonly requireActualResult?: boolean;
    readonly allowUnordered?: boolean;
  }[];
  readonly preconditions?: readonly string[];
};

export function assertManifestNotSealed(manifest: ExecutionManifest | null): void {
  if (manifest !== null) {
    throw new ExecutionConflictError("Execution manifest is already sealed");
  }
}

export function assertManifestSealed(
  manifest: ExecutionManifest | null,
): asserts manifest is ExecutionManifest {
  if (manifest === null || !manifest.sealedAt) {
    throw new ExecutionPreconditionError("Execution manifest must be sealed");
  }
}

export function normalizeManifestSteps(
  steps: ResolvedManifestInput["steps"],
): readonly ManifestStepSnapshot[] {
  if (steps.length === 0) {
    throw new ExecutionValidationError("Manifest must contain at least one step");
  }
  const orders = new Set<number>();
  return steps.map((step) => {
    if (orders.has(step.order)) {
      throw new ExecutionValidationError(
        `Duplicate manifest step order: ${step.order}`,
      );
    }
    orders.add(step.order);
    const instruction = step.instruction.trim();
    const expectedResult = step.expectedResult.trim();
    if (!instruction) {
      throw new ExecutionValidationError(`Step ${step.order} instruction is required`);
    }
    if (!expectedResult) {
      throw new ExecutionValidationError(
        `Step ${step.order} expectedResult is required`,
      );
    }
    return {
      order: step.order,
      instruction,
      expectedResult,
      preconditions: [...(step.preconditions ?? [])],
      requireActualResult: step.requireActualResult ?? true,
      allowUnordered: step.allowUnordered ?? false,
    };
  });
}

export function createSealedManifest(input: {
  readonly resolved: ResolvedManifestInput;
  readonly sourceRefs: ExecutionSourceRefs;
  readonly sealedAt: string;
  readonly sealedBy: string;
  readonly contentHash: string;
}): ExecutionManifest {
  const steps = normalizeManifestSteps(input.resolved.steps);
  return {
    sourceRefs: input.sourceRefs,
    steps,
    preconditions: [...(input.resolved.preconditions ?? [])],
    sealedAt: input.sealedAt.trim(),
    sealedBy: input.sealedBy.trim(),
    contentHash: input.contentHash.trim(),
  };
}

export function verifyManifestContentHash(
  manifest: ExecutionManifest,
  expectedHash: string,
): void {
  if (manifest.contentHash !== expectedHash) {
    throw new ExecutionConflictError("Manifest content hash mismatch on rehydrate");
  }
}
