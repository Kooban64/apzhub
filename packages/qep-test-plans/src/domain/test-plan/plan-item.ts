import { PlanValidationError } from "../../shared/errors";
import {
  createPlanNotes,
  createRequirementId,
  createSpecificationId,
} from "./value-objects";
import type { PlanItemStatus, RequirementId, SpecificationId } from "./value-objects";

export type TestPlanItem = {
  readonly id: string;
  readonly specificationId: SpecificationId;
  readonly specificationVersionPin?: string;
  readonly sequence: number;
  readonly itemStatus: PlanItemStatus;
  readonly notes?: string;
  readonly requirementRefs?: readonly RequirementId[];
};

export type CreateTestPlanItemInput = {
  readonly id: string;
  readonly specificationId: string;
  readonly specificationVersionPin?: string;
  readonly testCaseId?: string;
  readonly sequence: number;
  readonly itemStatus?: PlanItemStatus;
  readonly notes?: string;
  readonly requirementRefs?: readonly string[];
};

export function createTestPlanItem(input: CreateTestPlanItemInput): TestPlanItem {
  if (input.testCaseId?.trim()) {
    throw new PlanValidationError("testCaseId is not supported in v1");
  }
  const specificationVersionPin = input.specificationVersionPin?.trim();
  const requirementRefs = input.requirementRefs
    ?.map((ref) => createRequirementId(ref))
    .filter(Boolean);
  return {
    id: input.id.trim(),
    specificationId: createSpecificationId(input.specificationId),
    sequence: input.sequence,
    itemStatus: input.itemStatus ?? "included",
    ...(specificationVersionPin ? { specificationVersionPin } : {}),
    ...(input.notes ? { notes: createPlanNotes(input.notes) } : {}),
    ...(requirementRefs && requirementRefs.length > 0 ? { requirementRefs } : {}),
  };
}

export function updateTestPlanItem(
  item: TestPlanItem,
  patch: {
    readonly specificationVersionPin?: string | null;
    readonly sequence?: number;
    readonly itemStatus?: PlanItemStatus;
    readonly notes?: string | null;
    readonly requirementRefs?: readonly string[] | null;
    readonly testCaseId?: string | null;
  },
): TestPlanItem {
  if (patch.testCaseId?.trim()) {
    throw new PlanValidationError("testCaseId is not supported in v1");
  }
  const specificationVersionPin =
    patch.specificationVersionPin === null
      ? undefined
      : patch.specificationVersionPin !== undefined
        ? patch.specificationVersionPin.trim() || undefined
        : item.specificationVersionPin;
  const notes =
    patch.notes === null
      ? undefined
      : patch.notes !== undefined
        ? createPlanNotes(patch.notes)
        : item.notes;
  const requirementRefs =
    patch.requirementRefs === null
      ? undefined
      : patch.requirementRefs !== undefined
        ? patch.requirementRefs.map((ref) => createRequirementId(ref))
        : item.requirementRefs;
  return {
    ...item,
    ...(patch.sequence !== undefined ? { sequence: patch.sequence } : {}),
    ...(patch.itemStatus !== undefined ? { itemStatus: patch.itemStatus } : {}),
    ...(specificationVersionPin !== undefined ? { specificationVersionPin } : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(requirementRefs !== undefined ? { requirementRefs } : {}),
  };
}

export function itemSpecPinKey(item: TestPlanItem): string {
  return `${item.specificationId}::${item.specificationVersionPin ?? ""}`;
}

export function isActiveItem(item: TestPlanItem): boolean {
  return item.itemStatus !== "removed";
}
