import type {
  ServiceRequestContext,
  TestingReleaseGovernanceService,
} from "@apzhub/platform-service-contracts";
import type { TestingDomainServices } from "@apzhub/testing-services";

import { assertTestingContext } from "./assert-testing-context";
import { withTestingErrorMapping } from "./map-testing-error";

async function runTestingOperation<T>(
  ctx: ServiceRequestContext,
  fn: () => Promise<T>,
): Promise<T> {
  assertTestingContext(ctx);
  return withTestingErrorMapping(fn, ctx.correlationId);
}

export class TestingReleaseGovernanceServiceImpl implements TestingReleaseGovernanceService {
  constructor(private readonly domain: TestingDomainServices) {}

  createRelease(
    ctx: ServiceRequestContext,
    input: Parameters<TestingReleaseGovernanceService["createRelease"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.createRelease(ctx, input),
    );
  }

  getRelease(
    ctx: ServiceRequestContext,
    id: Parameters<TestingReleaseGovernanceService["getRelease"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.getRelease(ctx, id),
    );
  }

  listReleases(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.listReleases(ctx),
    );
  }

  updateReleaseMetadata(
    ctx: ServiceRequestContext,
    id: Parameters<TestingReleaseGovernanceService["updateReleaseMetadata"]>[1],
    input: Parameters<TestingReleaseGovernanceService["updateReleaseMetadata"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.updateReleaseMetadata(
        ctx,
        id,
        input,
      ),
    );
  }

  addScope(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["addScope"]>[1],
    input: Parameters<TestingReleaseGovernanceService["addScope"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.addScope(ctx, releaseId, input),
    );
  }

  removeScope(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["removeScope"]>[1],
    scopeId: Parameters<TestingReleaseGovernanceService["removeScope"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.removeScope(
        ctx,
        releaseId,
        scopeId,
      ),
    );
  }

  attachEvidence(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["attachEvidence"]>[1],
    input: Parameters<TestingReleaseGovernanceService["attachEvidence"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.attachEvidence(
        ctx,
        releaseId,
        input,
      ),
    );
  }

  removeEvidence(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["removeEvidence"]>[1],
    evidenceId: Parameters<TestingReleaseGovernanceService["removeEvidence"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.removeEvidence(
        ctx,
        releaseId,
        evidenceId,
      ),
    );
  }

  addPackage(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["addPackage"]>[1],
    input: Parameters<TestingReleaseGovernanceService["addPackage"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.addPackage(ctx, releaseId, input),
    );
  }

  addCandidate(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["addCandidate"]>[1],
    input: Parameters<TestingReleaseGovernanceService["addCandidate"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.addCandidate(
        ctx,
        releaseId,
        input,
      ),
    );
  }

  addNote(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["addNote"]>[1],
    input: Parameters<TestingReleaseGovernanceService["addNote"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.addNote(ctx, releaseId, input),
    );
  }

  addDependency(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["addDependency"]>[1],
    input: Parameters<TestingReleaseGovernanceService["addDependency"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.addDependency(
        ctx,
        releaseId,
        input,
      ),
    );
  }

  removeDependency(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["removeDependency"]>[1],
    dependencyId: Parameters<TestingReleaseGovernanceService["removeDependency"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.removeDependency(
        ctx,
        releaseId,
        dependencyId,
      ),
    );
  }

  evaluateReadiness(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["evaluateReadiness"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.evaluateReadiness(ctx, releaseId),
    );
  }

  evaluateRisk(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["evaluateRisk"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.evaluateRisk(ctx, releaseId),
    );
  }

  evaluateCertification(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["evaluateCertification"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.evaluateCertification(
        ctx,
        releaseId,
      ),
    );
  }

  evaluateApprovals(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["evaluateApprovals"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.evaluateApprovals(ctx, releaseId),
    );
  }

  generateReleaseSummary(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["generateReleaseSummary"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.generateReleaseSummary(
        ctx,
        releaseId,
      ),
    );
  }

  submitForReview(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["submitForReview"]>[1],
    reason?: Parameters<TestingReleaseGovernanceService["submitForReview"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.submitForReview(
        ctx,
        releaseId,
        reason,
      ),
    );
  }

  submitForApproval(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["submitForApproval"]>[1],
    reason?: Parameters<TestingReleaseGovernanceService["submitForApproval"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.submitForApproval(
        ctx,
        releaseId,
        reason,
      ),
    );
  }

  approveRelease(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["approveRelease"]>[1],
    rationale: Parameters<TestingReleaseGovernanceService["approveRelease"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.approveRelease(
        ctx,
        releaseId,
        rationale,
      ),
    );
  }

  conditionallyApproveRelease(
    ctx: ServiceRequestContext,
    releaseId: Parameters<
      TestingReleaseGovernanceService["conditionallyApproveRelease"]
    >[1],
    rationale: Parameters<
      TestingReleaseGovernanceService["conditionallyApproveRelease"]
    >[2],
    conditions?: Parameters<
      TestingReleaseGovernanceService["conditionallyApproveRelease"]
    >[3],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.conditionallyApproveRelease(
        ctx,
        releaseId,
        rationale,
        conditions,
      ),
    );
  }

  rejectRelease(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["rejectRelease"]>[1],
    rationale: Parameters<TestingReleaseGovernanceService["rejectRelease"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.rejectRelease(
        ctx,
        releaseId,
        rationale,
      ),
    );
  }

  withdrawRelease(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["withdrawRelease"]>[1],
    reason?: Parameters<TestingReleaseGovernanceService["withdrawRelease"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.withdrawRelease(
        ctx,
        releaseId,
        reason,
      ),
    );
  }

  archiveRelease(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["archiveRelease"]>[1],
    reason?: Parameters<TestingReleaseGovernanceService["archiveRelease"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.archiveRelease(
        ctx,
        releaseId,
        reason,
      ),
    );
  }

  restoreRelease(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["restoreRelease"]>[1],
    reason?: Parameters<TestingReleaseGovernanceService["restoreRelease"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.restoreRelease(
        ctx,
        releaseId,
        reason,
      ),
    );
  }

  requestApproval(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["requestApproval"]>[1],
    input: Parameters<TestingReleaseGovernanceService["requestApproval"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.requestApproval(
        ctx,
        releaseId,
        input,
      ),
    );
  }

  decideApproval(
    ctx: ServiceRequestContext,
    approvalId: Parameters<TestingReleaseGovernanceService["decideApproval"]>[1],
    input: Parameters<TestingReleaseGovernanceService["decideApproval"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.decideApproval(
        ctx,
        approvalId,
        input,
      ),
    );
  }

  listAudit(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["listAudit"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.listAudit(ctx, releaseId),
    );
  }

  getManifest(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["getManifest"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.getManifest(ctx, releaseId),
    );
  }

  listPackages(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["listPackages"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.listPackages(ctx, releaseId),
    );
  }

  listCandidates(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["listCandidates"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.listCandidates(ctx, releaseId),
    );
  }

  listScope(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["listScope"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.listScope(ctx, releaseId),
    );
  }

  listEvidence(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["listEvidence"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.listEvidence(ctx, releaseId),
    );
  }

  listNotes(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["listNotes"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.listNotes(ctx, releaseId),
    );
  }

  listDependencies(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["listDependencies"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.listDependencies(ctx, releaseId),
    );
  }

  listApprovals(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["listApprovals"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseGovernance.releaseGovernance.listApprovals(ctx, releaseId),
    );
  }

  consumePipelineSummary(
    ctx: ServiceRequestContext,
    releaseId: Parameters<TestingReleaseGovernanceService["consumePipelineSummary"]>[1],
    pipelineRunId: Parameters<
      TestingReleaseGovernanceService["consumePipelineSummary"]
    >[2],
  ) {
    return runTestingOperation(ctx, async () => {
      const run = await this.domain.pipelines.imports.getRun(ctx, pipelineRunId);
      const headline =
        run.summary.headline ?? `Pipeline run ${run.externalRunRef} (${run.status})`;
      const scope = await this.domain.releaseGovernance.releaseGovernance.addScope(
        ctx,
        releaseId,
        {
          kind: "pipeline",
          refId: pipelineRunId,
          label: headline,
        },
      );
      const evidence =
        await this.domain.releaseGovernance.releaseGovernance.attachEvidence(
          ctx,
          releaseId,
          {
            kind: "pipeline_summary",
            refId: pipelineRunId,
            summary: headline,
          },
        );
      return { scope, evidence };
    });
  }
}
