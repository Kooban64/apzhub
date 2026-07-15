import type { ServiceRequestContext } from "../../common/context";
import type { ArtifactReference } from "./pipeline-live-types";

/** Live CI artifact metadata (references only — no binary download). */
export interface TestingPipelineArtifactService {
  listArtifacts(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
  ): Promise<readonly ArtifactReference[]>;
}
