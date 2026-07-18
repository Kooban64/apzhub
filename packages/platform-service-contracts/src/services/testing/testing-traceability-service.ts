import type { ServiceRequestContext } from "../../common/context";
import type {
  RequirementId,
  TraceabilityEntityKind,
  TraceabilityLink,
  TraceabilityLinkId,
  TraceabilityLinkType,
  TraceabilityMatrixRow,
} from "@apzhub/testing-contracts";

/** Vendor-neutral testing traceability platform service. */
export interface TestingTraceabilityService {
  listLinks(ctx: ServiceRequestContext): Promise<readonly TraceabilityLink[]>;
  getLink(
    ctx: ServiceRequestContext,
    id: TraceabilityLinkId,
  ): Promise<TraceabilityLink>;
  createLink(
    ctx: ServiceRequestContext,
    input: Omit<TraceabilityLink, "id" | "createdAt" | "updatedAt">,
  ): Promise<TraceabilityLink>;
  removeLink(ctx: ServiceRequestContext, id: TraceabilityLinkId): Promise<void>;
  createRelationship(
    ctx: ServiceRequestContext,
    input: {
      readonly type: TraceabilityLinkType;
      readonly sourceKind: TraceabilityEntityKind | string;
      readonly sourceId: string;
      readonly targetKind: TraceabilityEntityKind | string;
      readonly targetId: string;
      readonly notes?: string;
      readonly tenantId: string;
    },
  ): Promise<TraceabilityLink>;
  removeRelationship(ctx: ServiceRequestContext, id: TraceabilityLinkId): Promise<void>;
  getMatrixForRequirement(
    ctx: ServiceRequestContext,
    requirementId: RequirementId,
  ): Promise<TraceabilityMatrixRow>;
  listMatrix(ctx: ServiceRequestContext): Promise<readonly TraceabilityMatrixRow[]>;
}
