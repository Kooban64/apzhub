import type { ServiceRequestContext } from "../../common/context";
import type {
  PipelineRunId,
  ReleaseEvidence,
  ReleaseGovernanceService,
  ReleaseId,
  ReleaseScope,
} from "@apzhub/testing-contracts";

/**
 * Platform gateway facet for TCMS-only Release & Quality Governance (APZTCMS-014/017).
 * Extends domain ReleaseGovernanceService with thin pipeline summary consumption.
 */
export interface TestingReleaseGovernanceService extends ReleaseGovernanceService {
  /**
   * Attach a persisted SoR pipeline run as release scope (kind: pipeline)
   * and optional evidence metadata. Does not automate release decisions.
   */
  consumePipelineSummary(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    pipelineRunId: PipelineRunId,
  ): Promise<{
    readonly scope: ReleaseScope;
    readonly evidence: ReleaseEvidence;
  }>;
}
