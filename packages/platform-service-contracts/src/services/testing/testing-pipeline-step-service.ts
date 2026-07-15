import type { ServiceRequestContext } from "../../common/context";
import type { PipelineStep } from "./pipeline-live-types";

/** Live CI step metadata — vendor-neutral. */
export interface TestingPipelineStepService {
  listSteps(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
    jobId: string | number,
  ): Promise<readonly PipelineStep[]>;
}
