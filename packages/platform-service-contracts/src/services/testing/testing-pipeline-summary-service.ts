import type { ServiceRequestContext } from "../../common/context";
import type { PipelineSummary } from "./pipeline-live-types";

/** Live CI run summary — vendor-neutral. */
export interface TestingPipelineSummaryService {
  retrieveSummary(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
  ): Promise<PipelineSummary>;
}
