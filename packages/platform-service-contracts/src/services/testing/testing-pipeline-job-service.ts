import type { ServiceRequestContext } from "../../common/context";
import type { PipelineJob } from "./pipeline-live-types";

/** Live CI job metadata — vendor-neutral. */
export interface TestingPipelineJobService {
  listJobs(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
  ): Promise<readonly PipelineJob[]>;
  getJob(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
    jobId: string | number,
  ): Promise<PipelineJob>;
}
