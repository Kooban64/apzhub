import type { AcceptanceCriteria } from "../value-objects/acceptance-criteria";
import type { RequirementApprovalState } from "../value-objects/requirement-approval-state";
import type { RequirementAttributes } from "../value-objects/requirement-attributes";
import type { RequirementBaselineReference } from "../value-objects/requirement-baseline-reference";
import type { RequirementId } from "../value-objects/requirement-id";
import type { RequirementOwner } from "../value-objects/requirement-owner";
import type { RequirementPriority } from "../value-objects/requirement-priority";
import type { RequirementReference } from "../value-objects/requirement-reference";
import type { RequirementStatus } from "../value-objects/requirement-status";
import type { RequirementType } from "../value-objects/requirement-type";
import type { RequirementVersion } from "../value-objects/requirement-version";
import { createRequirementId } from "../value-objects/requirement-id";
import { createRequirementStatus } from "../value-objects/requirement-status";
import { createRequirementType } from "../value-objects/requirement-type";
import { createRequirementPriority } from "../value-objects/requirement-priority";
import { createRequirementApprovalState } from "../value-objects/requirement-approval-state";
import { createRequirementAttributes } from "../value-objects/requirement-attributes";
import { createRequirementVersion } from "../value-objects/requirement-version";
import { createAcceptanceCriteria } from "../value-objects/acceptance-criteria";
import { QepInvariantViolation } from "../../shared/errors";

export type Requirement = {
  readonly id: RequirementId;
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly type: RequirementType;
  readonly status: RequirementStatus;
  readonly priority: RequirementPriority;
  readonly category?: string;
  readonly owner?: RequirementOwner;
  readonly approvalState: RequirementApprovalState;
  readonly version: RequirementVersion;
  readonly acceptanceCriteria?: AcceptanceCriteria;
  readonly attributes: RequirementAttributes;
  readonly references: readonly RequirementReference[];
  readonly baseline?: RequirementBaselineReference;
  readonly tenantId: string;
  readonly projectId: string;
};

export type CreateRequirementInput = {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: string;
  status?: string;
  priority: string;
  category?: string;
  owner?: RequirementOwner;
  approvalState?: string;
  version?: RequirementVersion;
  acceptanceCriteriaItems?: readonly string[];
  attributes?: { tags?: readonly string[]; custom?: Readonly<Record<string, string>> };
  references?: readonly RequirementReference[];
  baseline?: RequirementBaselineReference;
  tenantId: string;
  projectId: string;
};

export function createRequirement(input: CreateRequirementInput): Requirement {
  const key = input.key.trim();
  const title = input.title.trim();
  const tenantId = input.tenantId.trim();
  const projectId = input.projectId.trim();

  if (!key) throw new QepInvariantViolation("Requirement.key is required");
  if (!title) throw new QepInvariantViolation("Requirement.title is required");
  if (!tenantId) throw new QepInvariantViolation("Requirement.tenantId is required");
  if (!projectId) throw new QepInvariantViolation("Requirement.projectId is required");

  return {
    id: createRequirementId(input.id),
    key,
    title,
    ...(input.description?.trim() ? { description: input.description.trim() } : {}),
    type: createRequirementType(input.type),
    status: createRequirementStatus(input.status ?? "draft"),
    priority: createRequirementPriority(input.priority),
    ...(input.category?.trim() ? { category: input.category.trim() } : {}),
    ...(input.owner ? { owner: input.owner } : {}),
    approvalState: createRequirementApprovalState(
      input.approvalState ?? "not_submitted",
    ),
    version: input.version ?? createRequirementVersion(1, 0, 0),
    ...(input.acceptanceCriteriaItems
      ? {
          acceptanceCriteria: createAcceptanceCriteria(input.acceptanceCriteriaItems),
        }
      : {}),
    attributes: createRequirementAttributes(input.attributes),
    references: input.references ?? [],
    ...(input.baseline ? { baseline: input.baseline } : {}),
    tenantId,
    projectId,
  };
}
