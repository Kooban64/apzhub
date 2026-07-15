import type { ServiceRequestContext } from "../../common/context";
import type { Requirement, RequirementId } from "@apzhub/testing-contracts";

/** Vendor-neutral testing requirement platform service. */
export interface TestingRequirementService {
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
}
