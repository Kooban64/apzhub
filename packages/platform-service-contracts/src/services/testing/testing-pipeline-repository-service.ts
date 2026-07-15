import type { ServiceRequestContext } from "../../common/context";
import type { PipelineRepository } from "./pipeline-live-types";

/** Live CI repository metadata — vendor-neutral. */
export interface TestingPipelineRepositoryService {
  getRepository(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
  ): Promise<PipelineRepository>;
}
