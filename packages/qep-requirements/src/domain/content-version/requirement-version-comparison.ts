import type { RequirementSnapshot } from "./requirement-snapshot";
import { QepInvalidVersionComparisonError } from "../../shared/errors";

export type RequirementSnapshotChangeClassification =
  | "unchanged"
  | "added"
  | "removed"
  | "modified"
  | "collection_added"
  | "collection_removed"
  | "collection_reordered";

export type RequirementSnapshotFieldChange = {
  readonly field: string;
  readonly classification: RequirementSnapshotChangeClassification;
  readonly base: unknown;
  readonly target: unknown;
};

export type RequirementVersionComparison = {
  readonly requirementId: string;
  readonly baseVersionNumber: number;
  readonly targetVersionNumber: number;
  readonly fieldChanges: readonly RequirementSnapshotFieldChange[];
  readonly changedFieldCount: number;
};

export function compareSnapshots(
  base: RequirementSnapshot,
  target: RequirementSnapshot,
  meta?: {
    readonly requirementId: string;
    readonly baseVersionNumber: number;
    readonly targetVersionNumber: number;
  },
): RequirementVersionComparison {
  if (base.schemaVersion !== target.schemaVersion) {
    throw new QepInvalidVersionComparisonError("Snapshots use incompatible schema versions");
  }
  if (
    meta &&
    meta.baseVersionNumber === meta.targetVersionNumber
  ) {
    throw new QepInvalidVersionComparisonError(
      "Base and target content versions must be different",
    );
  }
  const fieldChanges = Object.keys(base)
    .sort()
    .map((field) => {
      const before = base[field as keyof RequirementSnapshot];
      const after = target[field as keyof RequirementSnapshot];
      return { field, classification: classify(before, after), base: before, target: after };
    });
  const changedFieldCount = fieldChanges.filter(
    (change) => change.classification !== "unchanged",
  ).length;
  return {
    requirementId: meta?.requirementId ?? base.requirementId,
    baseVersionNumber: meta?.baseVersionNumber ?? 0,
    targetVersionNumber: meta?.targetVersionNumber ?? 0,
    fieldChanges,
    changedFieldCount,
  };
}

function classify(before: unknown, after: unknown): RequirementSnapshotChangeClassification {
  if (same(before, after)) return "unchanged";
  if (before === null || before === undefined) return "added";
  if (after === null || after === undefined) return "removed";
  if (Array.isArray(before) && Array.isArray(after)) {
    if (before.length > after.length) return "collection_removed";
    if (before.length < after.length) return "collection_added";
    if (sameSet(before, after)) return "collection_reordered";
  }
  return "modified";
}

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameSet(left: readonly unknown[], right: readonly unknown[]): boolean {
  return [...left].map((value) => JSON.stringify(value)).sort().join("|") ===
    [...right].map((value) => JSON.stringify(value)).sort().join("|");
}
