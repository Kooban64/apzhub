import type { ServiceRequestContext } from "../../common/context";
import type { PipelineRunListQuery, PipelineRunView } from "./pipeline-live-types";

/**
 * Live CI pipeline run reads from a provider.
 * Named distinctly from SoR `TestingPipelinesService.getRun` / `listRuns`.
 */
export interface TestingPipelineRunLiveService {
  listRuns(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    query?: PipelineRunListQuery,
  ): Promise<readonly PipelineRunView[]>;
  getRun(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
  ): Promise<PipelineRunView>;
}
