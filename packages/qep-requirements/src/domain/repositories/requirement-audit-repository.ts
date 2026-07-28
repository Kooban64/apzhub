import type { RequirementId } from "../value-objects/requirement-id";

export type RequirementAuditEntry = {
  readonly id: string;
  readonly tenantId: string;
  readonly requirementId: RequirementId;
  readonly action: string;
  readonly actorUserId: string;
  readonly correlationId: string;
  readonly detailsJson: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
};

export interface RequirementAuditRepository {
  append(entry: RequirementAuditEntry): Promise<RequirementAuditEntry>;
  listByRequirement(
    tenantId: string,
    requirementId: RequirementId,
  ): Promise<readonly RequirementAuditEntry[]>;
}
