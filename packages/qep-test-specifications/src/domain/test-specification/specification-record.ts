import { createSpecificationId, type SpecificationId } from "./specification-id";
import type { SpecificationStatus } from "./specification-status";
import {
  createSpecificationAcceptanceCriteria,
  createSpecificationAuthor,
  createSpecificationClassification,
  createSpecificationComplexity,
  createSpecificationDependency,
  createSpecificationDescription,
  createSpecificationNumber,
  createSpecificationObjective,
  createSpecificationOwner,
  createSpecificationPostconditions,
  createSpecificationPreconditions,
  createSpecificationPriority,
  createSpecificationReviewer,
  createSpecificationRisk,
  createSpecificationScope,
  createSpecificationTag,
  createSpecificationTitle,
  createSpecificationType,
  createSpecificationVersion,
  type SpecificationAcceptanceCriteria,
  type SpecificationAuthor,
  type SpecificationClassification,
  type SpecificationComplexity,
  type SpecificationDependency,
  type SpecificationDescription,
  type SpecificationNumber,
  type SpecificationObjective,
  type SpecificationOwner,
  type SpecificationPostconditions,
  type SpecificationPreconditions,
  type SpecificationPriority,
  type SpecificationReviewer,
  type SpecificationRisk,
  type SpecificationScope,
  type SpecificationTag,
  type SpecificationTitle,
  type SpecificationType,
  type SpecificationVersion,
} from "./value-objects";

/**
 * Core Specification content entity within the TestSpecification aggregate.
 */
export type SpecificationRecord = {
  readonly id: SpecificationId;
  readonly number: SpecificationNumber;
  readonly title: SpecificationTitle;
  readonly description: SpecificationDescription;
  readonly objective: SpecificationObjective;
  readonly scope: SpecificationScope;
  readonly status: SpecificationStatus;
  readonly version: SpecificationVersion;
  readonly type: SpecificationType;
  readonly priority: SpecificationPriority;
  readonly complexity: SpecificationComplexity;
  readonly classification: SpecificationClassification;
  readonly owner: SpecificationOwner;
  readonly author: SpecificationAuthor;
  readonly reviewer?: SpecificationReviewer;
  readonly preconditions: SpecificationPreconditions;
  readonly postconditions: SpecificationPostconditions;
  readonly acceptanceCriteria: SpecificationAcceptanceCriteria;
  readonly risks: readonly SpecificationRisk[];
  readonly dependencies: readonly SpecificationDependency[];
  readonly tags: readonly SpecificationTag[];
  readonly isAuthoritative: boolean;
  readonly predecessorSpecificationId?: SpecificationId;
  readonly successorSpecificationId?: SpecificationId;
  readonly comparisonNotes?: string;
};

export type CreateSpecificationRecordInput = {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly objective: string;
  readonly scope: string;
  readonly type: string;
  readonly priority?: string;
  readonly complexity?: string;
  readonly classification: string;
  readonly owner: string;
  readonly author: string;
  readonly reviewer?: string;
  readonly majorVersion?: number;
  readonly minorVersion?: number;
  readonly preconditions?: readonly string[];
  readonly postconditions?: readonly string[];
  readonly acceptanceCriteria?: readonly string[];
  readonly risks?: readonly {
    readonly id: string;
    readonly summary: string;
    readonly severity?: string;
  }[];
  readonly dependencies?: readonly {
    readonly id: string;
    readonly summary: string;
    readonly referenceKind?: string;
    readonly referenceId?: string;
  }[];
  readonly tags?: readonly string[];
  readonly predecessorSpecificationId?: string;
  readonly comparisonNotes?: string;
};

export function createSpecificationRecord(
  input: CreateSpecificationRecordInput,
): SpecificationRecord {
  return {
    id: createSpecificationId(input.id),
    number: createSpecificationNumber(input.number),
    title: createSpecificationTitle(input.title),
    description: createSpecificationDescription(input.description),
    objective: createSpecificationObjective(input.objective),
    scope: createSpecificationScope(input.scope),
    status: "draft",
    version: createSpecificationVersion(
      input.majorVersion ?? 0,
      input.minorVersion ?? 1,
    ),
    type: createSpecificationType(input.type),
    priority: createSpecificationPriority(input.priority ?? "medium"),
    complexity: createSpecificationComplexity(input.complexity ?? "moderate"),
    classification: createSpecificationClassification(input.classification),
    owner: createSpecificationOwner(input.owner),
    author: createSpecificationAuthor(input.author),
    ...(input.reviewer
      ? { reviewer: createSpecificationReviewer(input.reviewer) }
      : {}),
    preconditions: createSpecificationPreconditions(input.preconditions ?? []),
    postconditions: createSpecificationPostconditions(input.postconditions ?? []),
    acceptanceCriteria: createSpecificationAcceptanceCriteria(
      input.acceptanceCriteria ?? [],
    ),
    risks: (input.risks ?? []).map(createSpecificationRisk),
    dependencies: (input.dependencies ?? []).map(createSpecificationDependency),
    tags: (input.tags ?? []).map(createSpecificationTag),
    isAuthoritative: false,
    ...(input.predecessorSpecificationId
      ? {
          predecessorSpecificationId: createSpecificationId(
            input.predecessorSpecificationId,
          ),
        }
      : {}),
    ...(input.comparisonNotes?.trim()
      ? { comparisonNotes: input.comparisonNotes.trim() }
      : {}),
  };
}

export function withRecordStatus(
  record: SpecificationRecord,
  status: SpecificationStatus,
  isAuthoritative: boolean,
): SpecificationRecord {
  return { ...record, status, isAuthoritative };
}

export function withRecordVersion(
  record: SpecificationRecord,
  version: SpecificationVersion,
): SpecificationRecord {
  return { ...record, version };
}

export function withRecordSuccessor(
  record: SpecificationRecord,
  successorSpecificationId: SpecificationId,
): SpecificationRecord {
  return { ...record, successorSpecificationId };
}
