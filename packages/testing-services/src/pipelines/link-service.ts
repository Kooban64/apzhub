/** Thin link façade over PipelineImportService link methods. */

import type { PipelineImportService } from "@apzhub/testing-contracts";

export type PipelineLinkService = Pick<
  PipelineImportService,
  "linkArtifacts" | "linkEvidence" | "linkCertifications" | "linkReleases" | "getLinks"
>;

export function createPipelineLinkService(
  imports: PipelineImportService,
): PipelineLinkService {
  return {
    linkArtifacts: (ctx, runId, artifacts) =>
      imports.linkArtifacts(ctx, runId, artifacts),
    linkEvidence: (ctx, runId, evidenceIds) =>
      imports.linkEvidence(ctx, runId, evidenceIds),
    linkCertifications: (ctx, runId, certificationRecordId) =>
      imports.linkCertifications(ctx, runId, certificationRecordId),
    linkReleases: (ctx, runId, releaseId) =>
      imports.linkReleases(ctx, runId, releaseId),
    getLinks: (ctx, runId) => imports.getLinks(ctx, runId),
  };
}
