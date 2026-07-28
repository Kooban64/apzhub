import type { PlanStatus } from "./value-objects";
import { computeItemFingerprint } from "./value-objects";

export type TestPlanRevision = {
  readonly versionLabel: string;
  readonly sealedAt: string;
  readonly sealedBy: string;
  readonly statusAtSeal: PlanStatus;
  readonly itemFingerprint: string;
  readonly predecessorVersionLabel?: string;
};

export type CreateTestPlanRevisionInput = {
  readonly versionLabel: string;
  readonly sealedAt: string;
  readonly sealedBy: string;
  readonly statusAtSeal: PlanStatus;
  readonly items: readonly {
    readonly id: string;
    readonly itemStatus: string;
    readonly specificationId: string;
    readonly specificationVersionPin?: string;
  }[];
  readonly predecessorVersionLabel?: string;
};

export function createTestPlanRevision(input: CreateTestPlanRevisionInput): TestPlanRevision {
  return {
    versionLabel: input.versionLabel,
    sealedAt: input.sealedAt,
    sealedBy: input.sealedBy,
    statusAtSeal: input.statusAtSeal,
    itemFingerprint: computeItemFingerprint(
      input.items.map((item) => ({
        id: item.id,
        itemStatus: item.itemStatus as "included" | "optional" | "deferred" | "removed",
        specificationId: item.specificationId,
        specificationVersionPin: item.specificationVersionPin,
      })),
    ),
    ...(input.predecessorVersionLabel
      ? { predecessorVersionLabel: input.predecessorVersionLabel }
      : {}),
  };
}
