import type { ServiceRequestContext } from "../../common/context";
import type { PipelineWorkflow } from "./pipeline-live-types";

/** Live CI workflow / pipeline definition metadata — vendor-neutral. */
export interface TestingPipelineWorkflowService {
  listWorkflows(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
  ): Promise<readonly PipelineWorkflow[]>;
  getWorkflow(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    workflowId: string | number,
  ): Promise<PipelineWorkflow>;
}
