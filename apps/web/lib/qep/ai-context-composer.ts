import {
  composeDeterministicAnalysis,
  hasPermission,
  hasSourceRead,
  type ComposedAiContext,
  type DeterministicAnalysis,
} from "@apzhub/qep-ai";

import { getApplicationService } from "./application-runtime";
import { getAssuranceService } from "./assurance-runtime";
import { getDefinitionService } from "./definition-runtime";
import { getTestManagementService } from "./test-management-runtime";

export type ComposeAiContextInput = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly granted: readonly string[];
  readonly evidenceExtract?: boolean;
  readonly includeSource?: boolean;
};

export async function composePermissionSafeAiContext(
  input: ComposeAiContextInput,
): Promise<ComposedAiContext> {
  const application = await getApplicationService().get(
    input.tenantId,
    input.applicationId,
  );
  const sourceOk = hasSourceRead(input.granted);
  const denied: string[] = [];
  if (!sourceOk) denied.push("source.read");
  if (
    !hasPermission(input.granted, "qep.evidence.read") &&
    !hasPermission(input.granted, "qep.*")
  ) {
    denied.push("qep.evidence.read");
  }

  const [stories, criteria, testCases] = await Promise.all([
    getDefinitionService().listStories({
      tenantId: input.tenantId,
      applicationId: application.id,
    }),
    getDefinitionService().listCriteria({
      tenantId: input.tenantId,
      applicationId: application.id,
    }),
    getTestManagementService().listTestCases({
      tenantId: input.tenantId,
      applicationId: application.id,
    }),
  ]);

  const records = [
    ...stories.slice(0, 40).map((row) => ({
      kind: "user_story",
      id: row.id,
      title: row.title,
      updatedAt: row.updatedAt,
    })),
    ...criteria.slice(0, 40).map((row) => ({
      kind: "acceptance_criterion",
      id: row.id,
      title: row.text,
      updatedAt: row.updatedAt,
    })),
    ...testCases.slice(0, 40).map((row) => ({
      kind: "test_case",
      id: row.id,
      title: row.title,
      updatedAt: row.updatedAt,
    })),
  ];

  let source: ComposedAiContext["source"];
  if (sourceOk && input.includeSource) {
    const links = await getApplicationService().listRepositories(
      input.tenantId,
      application.id,
    );
    const first = links[0];
    if (first) {
      source = {
        repositoryId: first.scmRepositoryId,
        path: "(repository association metadata)",
      };
    }
  }

  const evidence: ComposedAiContext["evidence"] = [];
  const evidenceMode =
    input.evidenceExtract && hasPermission(input.granted, "qep.evidence.read")
      ? "bounded_extract"
      : "metadata";

  return {
    tenantId: input.tenantId,
    applicationId: application.id,
    sourceAccess: sourceOk ? "authorised" : "not_authorised",
    sourceAuthorised: Boolean(sourceOk && source),
    evidenceMode,
    records,
    evidence,
    ...(source && sourceOk ? { source } : {}),
    denied,
  };
}

export async function composeDeterministicQualityAnalysis(input: {
  readonly tenantId: string;
  readonly applicationId: string;
}): Promise<DeterministicAnalysis> {
  const [criteria, testCases, risks, evaluations] = await Promise.all([
    getDefinitionService().listCriteria({
      tenantId: input.tenantId,
      applicationId: input.applicationId,
    }),
    getTestManagementService().listTestCases({
      tenantId: input.tenantId,
      applicationId: input.applicationId,
    }),
    getAssuranceService().listRisks(input.tenantId, input.applicationId),
    getAssuranceService().listGateEvaluations(input.tenantId, input.applicationId),
  ]);

  const acWithoutVerification = criteria.filter(
    (row) => row.status !== "archived" && row.verificationCount === 0,
  ).length;
  const neverExecuted = testCases.filter((row) => row.lastResult === "not_run").length;
  const failedWithoutEvidence = testCases.filter(
    (row) => row.lastResult === "fail",
  ).length;
  const missingTrace = testCases.filter((row) => row.criterionIds.length === 0).length;
  const openRisks = risks.filter((row) => row.status === "open").length;
  const failedGates = evaluations.filter((row) => row.result === "failed").length;

  return composeDeterministicAnalysis({
    tenantId: input.tenantId,
    applicationId: input.applicationId,
    acWithoutVerification,
    neverExecuted,
    failedWithoutEvidence,
    missingTrace,
    openDefects: 0,
    failedGates,
    openRisks,
  });
}

export async function companionFacts(input: {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly granted: readonly string[];
}) {
  const [readiness, analysis, context] = await Promise.all([
    getAssuranceService().composeReadiness({
      tenantId: input.tenantId,
      applicationId: input.applicationId,
    }),
    composeDeterministicQualityAnalysis(input),
    composePermissionSafeAiContext({
      tenantId: input.tenantId,
      applicationId: input.applicationId,
      granted: input.granted,
    }),
  ]);
  return { readiness, analysis, context };
}
