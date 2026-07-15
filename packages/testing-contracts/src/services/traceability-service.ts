import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { TraceabilityLink, TraceabilityMatrixRow } from "../domain";
import type { TraceabilityEntityKind, TraceabilityLinkType } from "../enums";
import type { RequirementId, TraceabilityLinkId } from "../identifiers";

/** Requirement ↔ case ↔ risk ↔ execution ↔ evidence traceability contract. */
export interface TraceabilityService {
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
  listOutgoing(
    ctx: ServiceRequestContext,
    kind: TraceabilityEntityKind | string,
    id: string,
  ): Promise<readonly TraceabilityLink[]>;
  listIncoming(
    ctx: ServiceRequestContext,
    kind: TraceabilityEntityKind | string,
    id: string,
  ): Promise<readonly TraceabilityLink[]>;
  getBidirectional(
    ctx: ServiceRequestContext,
    kind: TraceabilityEntityKind | string,
    id: string,
  ): Promise<{
    readonly outgoing: readonly TraceabilityLink[];
    readonly incoming: readonly TraceabilityLink[];
  }>;
  linkEntities(
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
  getMatrixForRequirement(
    ctx: ServiceRequestContext,
    requirementId: RequirementId,
  ): Promise<TraceabilityMatrixRow>;
  listMatrix(ctx: ServiceRequestContext): Promise<readonly TraceabilityMatrixRow[]>;
}
