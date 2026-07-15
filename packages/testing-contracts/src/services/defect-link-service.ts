import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { DefectLink } from "../domain";
import type { DefectLinkId } from "../identifiers";
import type { DefectLinkTarget, DefectStatus } from "../enums";

export type DefectLinkCreateInput = Omit<
  DefectLink,
  "id" | "createdAt" | "updatedAt" | "tenantId"
> & {
  readonly tenantId?: string;
};

export type DefectLinkUpdateInput = Partial<
  Omit<DefectLink, "id" | "tenantId" | "createdAt" | "createdBy">
>;

/** Defect relationship domain service — permissions: defects.*. */
export interface DefectLinkService {
  create(ctx: ServiceRequestContext, input: DefectLinkCreateInput): Promise<DefectLink>;
  update(
    ctx: ServiceRequestContext,
    id: DefectLinkId,
    input: DefectLinkUpdateInput,
  ): Promise<DefectLink>;
  list(ctx: ServiceRequestContext): Promise<readonly DefectLink[]>;
  get(ctx: ServiceRequestContext, id: DefectLinkId): Promise<DefectLink>;
  linkTo(
    ctx: ServiceRequestContext,
    id: DefectLinkId,
    entityKind: DefectLinkTarget | string,
    entityId: string,
  ): Promise<DefectLink>;
  unlinkFrom(
    ctx: ServiceRequestContext,
    id: DefectLinkId,
    entityKind: DefectLinkTarget | string,
    entityId: string,
  ): Promise<DefectLink>;
  archive(ctx: ServiceRequestContext, id: DefectLinkId): Promise<DefectLink>;
  listByStatus(
    ctx: ServiceRequestContext,
    status: DefectStatus,
  ): Promise<readonly DefectLink[]>;
}
