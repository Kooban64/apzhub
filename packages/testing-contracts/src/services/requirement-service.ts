import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { Requirement } from "../domain";
import type { RequirementId } from "../identifiers";

/** Requirement domain service — authoring and relationship management. */
export interface RequirementService {
  list(ctx: ServiceRequestContext): Promise<readonly Requirement[]>;
  get(ctx: ServiceRequestContext, id: RequirementId): Promise<Requirement>;
  create(
    ctx: ServiceRequestContext,
    input: Omit<Requirement, "id" | "createdAt" | "updatedAt">,
  ): Promise<Requirement>;
  update(
    ctx: ServiceRequestContext,
    id: RequirementId,
    input: Partial<Omit<Requirement, "id" | "tenantId" | "createdAt">>,
  ): Promise<Requirement>;
  archive(ctx: ServiceRequestContext, id: RequirementId): Promise<Requirement>;
  linkWorkItem(
    ctx: ServiceRequestContext,
    id: RequirementId,
    workItemRef: Requirement["workItemRefs"][number],
  ): Promise<Requirement>;
  unlinkWorkItem(
    ctx: ServiceRequestContext,
    id: RequirementId,
    workItemId: string,
  ): Promise<Requirement>;
}
