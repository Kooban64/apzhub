import type { RequirementId } from "../value-objects/requirement-id";
import type { RequirementStatus } from "../value-objects/requirement-status";

export type RequirementLifecycleHistoryEntry = {
  readonly id: string;
  readonly tenantId: string;
  readonly requirementId: RequirementId;
  readonly previousState: RequirementStatus;
  readonly newState: RequirementStatus;
  readonly action: string;
  readonly actorUserId: string;
  readonly reason?: string;
  readonly comments?: string;
  readonly correlationId: string;
  readonly revision?: number;
  readonly metadataJson?: Readonly<Record<string, string>>;
  readonly createdAt: string;
};

export type AppendRequirementLifecycleHistoryInput = Omit<
  RequirementLifecycleHistoryEntry,
  "id" | "createdAt"
> & {
  readonly id?: string;
  readonly createdAt?: string;
};

/** Persistence port for requirement lifecycle history (ENG-020C). */
export interface RequirementLifecycleHistoryRepository {
  append(
    entry: AppendRequirementLifecycleHistoryInput,
  ): Promise<RequirementLifecycleHistoryEntry>;
  listByRequirement(
    tenantId: string,
    requirementId: RequirementId,
  ): Promise<readonly RequirementLifecycleHistoryEntry[]>;
}
