import type { ServiceRequestContext } from "../../common/context";
import type {
  DefectLink,
  DefectLinkCreateInput,
  DefectLinkId,
  DefectLinkTarget,
  DefectLinkUpdateInput,
} from "@apzhub/testing-contracts";

/** Vendor-neutral testing defect link platform service. */
export interface TestingDefectService {
  list(ctx: ServiceRequestContext): Promise<readonly DefectLink[]>;
  get(ctx: ServiceRequestContext, id: DefectLinkId): Promise<DefectLink>;
  create(
    ctx: ServiceRequestContext,
    input: DefectLinkCreateInput,
  ): Promise<DefectLink>;
  link(
    ctx: ServiceRequestContext,
    id: DefectLinkId,
    entityKind: DefectLinkTarget | string,
    entityId: string,
  ): Promise<DefectLink>;
  update(
    ctx: ServiceRequestContext,
    id: DefectLinkId,
    input: DefectLinkUpdateInput,
  ): Promise<DefectLink>;
  archive(ctx: ServiceRequestContext, id: DefectLinkId): Promise<DefectLink>;
}
