import type { NextRequest } from "next/server";
import type { z } from "zod";

import type {
  TestingApprovalService,
  TestingAutomationService,
  TestingCaseService,
  TestingCertificationService,
  TestingCoverageService,
  TestingDefectService,
  TestingEvidenceService,
  TestingExecutionService,
  TestingPlanService,
  TestingQualityService,
  TestingRequirementService,
  TestingSuiteService,
  TestingTraceabilityService,
} from "@apzhub/platform-service-contracts";
import { PlatformServiceError } from "@apzhub/platform-service-contracts";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  approvalIdParamSchema,
  automationAggregateCoverageQuerySchema,
  automationImportBodySchema,
  caseIdParamSchema,
  certificationConditionalApproveBodySchema,
  certificationCreateBodySchema,
  certificationIdParamSchema,
  certificationPrepareBodySchema,
  certificationReasonBodySchema,
  certificationRequiredReasonBodySchema,
  cloneCaseBodySchema,
  clonePlanBodySchema,
  cloneSuiteBodySchema,
  canonicalAutomationResultBodySchema,
  coverageIdParamSchema,
  coverageListQuerySchema,
  coverageRecomputeBodySchema,
  defectCreateBodySchema,
  defectIdParamSchema,
  defectLinkBodySchema,
  defectUpdateBodySchema,
  evidenceIdParamSchema,
  evidenceRegisterBodySchema,
  evidenceRejectBodySchema,
  evidenceVerifyBodySchema,
  executionAssignBodySchema,
  executionCommentBodySchema,
  executionCompleteBodySchema,
  executionCreateBodySchema,
  executionIdParamSchema,
  executionReasonBodySchema,
  executionRejectBodySchema,
  executionStepPatchBodySchema,
  importIdParamSchema,
  planIdParamSchema,
  qualityRegressionQuerySchema,
  qualityScopeQuerySchema,
  qualityTrendsQuerySchema,
  releaseIdParamSchema,
  releaseReadinessQuerySchema,
  relationshipIdParamSchema,
  requirementCreateBodySchema,
  requirementIdParamSchema,
  requirementUpdateBodySchema,
  resourceIdParamSchema,
  stepIdParamSchema,
  suiteIdParamSchema,
  TESTING_AUTOMATION_MAX_BODY_BYTES,
  testCaseCreateBodySchema,
  testCaseTransitionBodySchema,
  testCaseUpdateBodySchema,
  testingListQuerySchema,
  testPlanCreateBodySchema,
  testPlanUpdateBodySchema,
  testSuiteCreateBodySchema,
  testSuiteUpdateBodySchema,
  traceabilityCreateBodySchema,
  traceabilityResourceTypeParamSchema,
} from "../schemas/testing";

type RouteContext = { params: Promise<Record<string, string>> };

type RequirementId = Parameters<TestingRequirementService["get"]>[1];
type TestPlanId = Parameters<TestingPlanService["get"]>[1];
type TestSuiteId = Parameters<TestingSuiteService["get"]>[1];
type TestCaseId = Parameters<TestingCaseService["get"]>[1];
type ManualExecutionId = Parameters<TestingExecutionService["get"]>[1];
type TestStepId = Parameters<TestingExecutionService["recordStepActual"]>[2];
type TestResultStatus = Parameters<TestingExecutionService["setStepStatus"]>[3];
type EvidenceId = Parameters<TestingEvidenceService["getEvidence"]>[1];
type AutomationImportId = Parameters<TestingAutomationService["getImport"]>[1];
type AutomatedExecutionId = Parameters<TestingAutomationService["aggregateCoverage"]>[1];
type CoverageMetricId = Parameters<TestingCoverageService["getMetric"]>[1];
type DefectLinkId = Parameters<TestingDefectService["get"]>[1];
type QualityScope = NonNullable<Parameters<TestingQualityService["summarize"]>[1]>;
type CertificationRecordId = Parameters<TestingCertificationService["get"]>[1];
type ApprovalId = Parameters<TestingApprovalService["get"]>[1];
type TraceabilityLinkId = Parameters<TestingTraceabilityService["removeLink"]>[1];
type CanonicalAutomationResult = Parameters<TestingAutomationService["validateImport"]>[1];


function listPage(items: readonly unknown[]) {
  return { cursor: null, nextCursor: null, limit: items.length, hasMore: false };
}

function collection<T>(items: readonly T[], context: PlatformApiRequestContext) {
  return jsonCollectionResponse(items, listPage(items), context.tracing);
}

function withTenant<T extends object>(input: T, context: PlatformApiRequestContext): T & { readonly tenantId: string } {
  return { ...input, tenantId: context.serviceContext.tenantId };
}

async function parseOptionalJsonBody<T>(
  request: NextRequest,
  schema: z.ZodType<T>,
  maxBytes: number,
): Promise<T> {
  const contentLength = request.headers.get("content-length");
  const contentType = request.headers.get("content-type");
  if ((contentLength === null || contentLength === "0") && !contentType) {
    return schema.parse({});
  }
  return parseJsonBody(request, schema, maxBytes);
}

async function param(
  routeContext: RouteContext | undefined,
  key: string,
  schema: z.ZodType<string>,
): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(schema, params?.[key] ?? "", key);
}

function unsupportedRisk(context: PlatformApiRequestContext): never {
  throw new PlatformServiceError({
    category: "configuration",
    code: "PROVIDER_CAPABILITY_UNSUPPORTED",
    message: "Testing quality risk endpoint is not supported by the TestingQualityService contract",
    correlationId: context.tracing.correlationId,
    retryable: false,
  });
}

export async function handleListTestingRequirements(request: NextRequest, context: PlatformApiRequestContext) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.requirements.list(context.serviceContext), context);
}

export async function handleGetTestingRequirement(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "requirementId", requirementIdParamSchema)) as RequirementId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.requirements.get(context.serviceContext, id), context.tracing);
}

export async function handleCreateTestingRequirement(request: NextRequest, context: PlatformApiRequestContext) {
  const body = await parseJsonBody(request, requirementCreateBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  const input = withTenant(body, context) as unknown as Parameters<TestingRequirementService["create"]>[1];
  return jsonDataResponse(await gateway.testing.requirements.create(context.serviceContext, input), context.tracing, { status: 201 });
}

export async function handleUpdateTestingRequirement(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "requirementId", requirementIdParamSchema)) as RequirementId;
  const body = await parseJsonBody(request, requirementUpdateBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.requirements.update(context.serviceContext, id, body as unknown as Parameters<TestingRequirementService["update"]>[2]), context.tracing);
}

export async function handleArchiveTestingRequirement(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "requirementId", requirementIdParamSchema)) as RequirementId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.requirements.archive(context.serviceContext, id), context.tracing);
}

export async function handleListTestingPlans(request: NextRequest, context: PlatformApiRequestContext) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.plans.list(context.serviceContext), context);
}

export async function handleGetTestingPlan(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "planId", planIdParamSchema)) as TestPlanId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.plans.get(context.serviceContext, id), context.tracing);
}

export async function handleCreateTestingPlan(request: NextRequest, context: PlatformApiRequestContext) {
  const body = await parseJsonBody(request, testPlanCreateBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  const input = withTenant(body, context) as unknown as Parameters<TestingPlanService["create"]>[1];
  return jsonDataResponse(await gateway.testing.plans.create(context.serviceContext, input), context.tracing, { status: 201 });
}

export async function handleUpdateTestingPlan(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "planId", planIdParamSchema)) as TestPlanId;
  const body = await parseJsonBody(request, testPlanUpdateBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.plans.update(context.serviceContext, id, body as unknown as Parameters<TestingPlanService["update"]>[2]), context.tracing);
}

export async function handleCloneTestingPlan(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "planId", planIdParamSchema)) as TestPlanId;
  const body = await parseOptionalJsonBody(request, clonePlanBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.plans.clone(context.serviceContext, id, body), context.tracing, { status: 201 });
}

export async function handleArchiveTestingPlan(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "planId", planIdParamSchema)) as TestPlanId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.plans.archive(context.serviceContext, id), context.tracing);
}

export async function handleListTestingSuites(request: NextRequest, context: PlatformApiRequestContext) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.suites.list(context.serviceContext), context);
}

export async function handleGetTestingSuite(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "suiteId", suiteIdParamSchema)) as TestSuiteId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.suites.get(context.serviceContext, id), context.tracing);
}

export async function handleCreateTestingSuite(request: NextRequest, context: PlatformApiRequestContext) {
  const body = await parseJsonBody(request, testSuiteCreateBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  const input = withTenant(body, context) as unknown as Parameters<TestingSuiteService["create"]>[1];
  return jsonDataResponse(await gateway.testing.suites.create(context.serviceContext, input), context.tracing, { status: 201 });
}

export async function handleUpdateTestingSuite(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "suiteId", suiteIdParamSchema)) as TestSuiteId;
  const body = await parseJsonBody(request, testSuiteUpdateBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.suites.update(context.serviceContext, id, body as unknown as Parameters<TestingSuiteService["update"]>[2]), context.tracing);
}

export async function handleCloneTestingSuite(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "suiteId", suiteIdParamSchema)) as TestSuiteId;
  const body = await parseOptionalJsonBody(request, cloneSuiteBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.suites.clone(context.serviceContext, id, body), context.tracing, { status: 201 });
}

export async function handleArchiveTestingSuite(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "suiteId", suiteIdParamSchema)) as TestSuiteId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.suites.archive(context.serviceContext, id), context.tracing);
}

export async function handleListTestingCases(request: NextRequest, context: PlatformApiRequestContext) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.cases.list(context.serviceContext), context);
}

export async function handleGetTestingCase(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "caseId", caseIdParamSchema)) as TestCaseId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.cases.get(context.serviceContext, id), context.tracing);
}

export async function handleCreateTestingCase(request: NextRequest, context: PlatformApiRequestContext) {
  const body = await parseJsonBody(request, testCaseCreateBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  const input = withTenant(body, context) as unknown as Parameters<TestingCaseService["create"]>[1];
  return jsonDataResponse(await gateway.testing.cases.create(context.serviceContext, input), context.tracing, { status: 201 });
}

export async function handleUpdateTestingCase(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "caseId", caseIdParamSchema)) as TestCaseId;
  const body = await parseJsonBody(request, testCaseUpdateBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.cases.update(context.serviceContext, id, body as unknown as Parameters<TestingCaseService["update"]>[2]), context.tracing);
}

export async function handleCloneTestingCase(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "caseId", caseIdParamSchema)) as TestCaseId;
  const body = await parseOptionalJsonBody(request, cloneCaseBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.cases.clone(context.serviceContext, id, body), context.tracing, { status: 201 });
}

export async function handleArchiveTestingCase(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "caseId", caseIdParamSchema)) as TestCaseId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.cases.archive(context.serviceContext, id), context.tracing);
}

export async function handleTransitionTestingCase(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "caseId", caseIdParamSchema)) as TestCaseId;
  const body = await parseJsonBody(request, testCaseTransitionBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.cases.transitionStatus(context.serviceContext, id, body.status), context.tracing);
}

export async function handleListTestingExecutions(request: NextRequest, context: PlatformApiRequestContext) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.executions.list(context.serviceContext), context);
}

export async function handleGetTestingExecution(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "executionId", executionIdParamSchema)) as ManualExecutionId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.get(context.serviceContext, id), context.tracing);
}

export async function handleCreateTestingExecution(request: NextRequest, context: PlatformApiRequestContext) {
  const body = await parseJsonBody(request, executionCreateBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  const input = withTenant(body, context) as Parameters<TestingExecutionService["create"]>[1];
  return jsonDataResponse(await gateway.testing.executions.create(context.serviceContext, input), context.tracing, { status: 201 });
}

export async function handleArchiveTestingExecution(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "executionId", executionIdParamSchema)) as ManualExecutionId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.archive(context.serviceContext, id), context.tracing);
}

async function executionId(routeContext?: RouteContext): Promise<ManualExecutionId> {
  return (await param(routeContext, "executionId", executionIdParamSchema)) as ManualExecutionId;
}

export async function handleAssignTestingExecution(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseJsonBody(request, executionAssignBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.assign(context.serviceContext, await executionId(routeContext), body.assigneeId), context.tracing);
}

export async function handleStartTestingExecution(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.start(context.serviceContext, await executionId(routeContext)), context.tracing);
}

export async function handlePauseTestingExecution(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.pause(context.serviceContext, await executionId(routeContext)), context.tracing);
}

export async function handleResumeTestingExecution(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.resume(context.serviceContext, await executionId(routeContext)), context.tracing);
}

export async function handleBlockTestingExecution(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseOptionalJsonBody(request, executionReasonBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.block(context.serviceContext, await executionId(routeContext), body.reason), context.tracing);
}

export async function handleUnblockTestingExecution(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.unblock(context.serviceContext, await executionId(routeContext)), context.tracing);
}

export async function handleCompleteTestingExecution(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseOptionalJsonBody(request, executionCompleteBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.complete(context.serviceContext, await executionId(routeContext), body.overallResult), context.tracing);
}

export async function handleSubmitTestingExecutionForReview(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.submitForReview(context.serviceContext, await executionId(routeContext)), context.tracing);
}

export async function handleApproveTestingExecution(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseOptionalJsonBody(request, executionCommentBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.approve(context.serviceContext, await executionId(routeContext), body.comments), context.tracing);
}

export async function handleRejectTestingExecution(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseJsonBody(request, executionRejectBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.reject(context.serviceContext, await executionId(routeContext), body.comments), context.tracing);
}

export async function handleReopenTestingExecution(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.reopen(context.serviceContext, await executionId(routeContext)), context.tracing);
}

export async function handleCancelTestingExecution(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseOptionalJsonBody(request, executionReasonBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.cancel(context.serviceContext, await executionId(routeContext), body.reason), context.tracing);
}

export async function handleRestoreTestingExecution(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.executions.restore(context.serviceContext, await executionId(routeContext)), context.tracing);
}

export async function handlePatchTestingExecutionStep(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = await executionId(routeContext);
  const stepId = (await param(routeContext, "stepId", stepIdParamSchema)) as TestStepId;
  const body = await parseJsonBody(request, executionStepPatchBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  if (body.status !== undefined && Object.keys(body).length === 1) {
    return jsonDataResponse(await gateway.testing.executions.setStepStatus(context.serviceContext, id, stepId, body.status), context.tracing);
  }
  const actual = { ...body };
  const status = actual.status;
  delete actual.status;
  const recorded = await gateway.testing.executions.recordStepActual(context.serviceContext, id, stepId, actual as unknown as Parameters<TestingExecutionService["recordStepActual"]>[3]);
  if (status !== undefined) {
    return jsonDataResponse(await gateway.testing.executions.setStepStatus(context.serviceContext, id, stepId, status as TestResultStatus), context.tracing);
  }
  return jsonDataResponse(recorded, context.tracing);
}

export async function handleListTestingEvidence(request: NextRequest, context: PlatformApiRequestContext) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.evidence.listEvidence(context.serviceContext), context);
}

export async function handleGetTestingEvidence(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "evidenceId", evidenceIdParamSchema)) as EvidenceId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.evidence.getEvidence(context.serviceContext, id), context.tracing);
}

export async function handleRegisterTestingEvidence(request: NextRequest, context: PlatformApiRequestContext) {
  const body = await parseJsonBody(request, evidenceRegisterBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  const input = withTenant(body, context) as unknown as Parameters<TestingEvidenceService["registerEvidence"]>[1];
  return jsonDataResponse(await gateway.testing.evidence.registerEvidence(context.serviceContext, input), context.tracing, { status: 201 });
}

export async function handleArchiveTestingEvidence(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "evidenceId", evidenceIdParamSchema)) as EvidenceId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.evidence.archiveEvidence(context.serviceContext, id), context.tracing);
}

async function evidenceId(routeContext?: RouteContext): Promise<EvidenceId> {
  return (await param(routeContext, "evidenceId", evidenceIdParamSchema)) as EvidenceId;
}

export async function handleSubmitTestingEvidence(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.evidence.submitEvidence(context.serviceContext, await evidenceId(routeContext)), context.tracing);
}

export async function handleVerifyTestingEvidence(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseOptionalJsonBody(request, evidenceVerifyBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.evidence.verifyEvidence(context.serviceContext, await evidenceId(routeContext), body.verificationState), context.tracing);
}

export async function handleApproveTestingEvidence(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.evidence.approveEvidence(context.serviceContext, await evidenceId(routeContext)), context.tracing);
}

export async function handleRejectTestingEvidence(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseOptionalJsonBody(request, evidenceRejectBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.evidence.rejectEvidence(context.serviceContext, await evidenceId(routeContext), body.reason), context.tracing);
}

export async function handleValidateTestingAutomationImport(request: NextRequest, context: PlatformApiRequestContext) {
  const result = (await parseJsonBody(
    request,
    canonicalAutomationResultBodySchema,
    TESTING_AUTOMATION_MAX_BODY_BYTES,
  )) as CanonicalAutomationResult;
  const gateway = await getPlatformServiceGateway();
  await gateway.testing.automation.validateImport(context.serviceContext, result as Parameters<TestingAutomationService["validateImport"]>[1]);
  return jsonDataResponse({ valid: true }, context.tracing);
}

export async function handleImportTestingAutomationResult(request: NextRequest, context: PlatformApiRequestContext) {
  const body = await parseJsonBody(request, automationImportBodySchema, TESTING_AUTOMATION_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.automation.importResult(context.serviceContext, body), context.tracing, { status: 201 });
}

export async function handleListTestingAutomationImports(request: NextRequest, context: PlatformApiRequestContext) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.automation.listImports(context.serviceContext), context);
}

export async function handleGetTestingAutomationImport(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "importId", importIdParamSchema)) as AutomationImportId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.automation.getImport(context.serviceContext, id), context.tracing);
}

export async function handleListTestingAutomationImportHistory(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "importId", importIdParamSchema)) as AutomationImportId;
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.automation.listImportHistory(context.serviceContext, id), context);
}

export async function handleListTestingAutomationCoverage(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const query = parseQuery(automationAggregateCoverageQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  if (query.executionId) {
    return jsonDataResponse(await gateway.testing.automation.aggregateCoverage(context.serviceContext, query.executionId as AutomatedExecutionId), context.tracing);
  }
  const id = (await param(routeContext, "importId", importIdParamSchema)) as AutomationImportId;
  return collection(await gateway.testing.automation.listCoverageSnapshots(context.serviceContext, id), context);
}

export async function handleListTestingCoverageMetrics(request: NextRequest, context: PlatformApiRequestContext) {
  const query = parseQuery(coverageListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  if (query.kind) return collection(await gateway.testing.coverage.listMetricsByKind(context.serviceContext, query.kind), context);
  if (query.planId) return collection(await gateway.testing.coverage.listMetricsForPlan(context.serviceContext, query.planId as TestPlanId), context);
  if (query.subjectId) return collection(await gateway.testing.coverage.listMetricsForSubject(context.serviceContext, query.subjectId), context);
  return collection(await gateway.testing.coverage.listMetrics(context.serviceContext), context);
}

export async function handleGetTestingCoverageMetric(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "coverageId", coverageIdParamSchema)) as CoverageMetricId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.coverage.getMetric(context.serviceContext, id), context.tracing);
}

export async function handleRecomputeTestingCoverage(request: NextRequest, context: PlatformApiRequestContext) {
  const body = await parseOptionalJsonBody(request, coverageRecomputeBodySchema, PLATFORM_API_MAX_BODY_BYTES) as QualityScope;
  const gateway = await getPlatformServiceGateway();
  if (body.planId && Object.keys(body).length === 1) {
    return jsonDataResponse(await gateway.testing.coverage.requestRecompute(context.serviceContext, body.planId as TestPlanId), context.tracing, { status: 202 });
  }
  return collection(await gateway.testing.coverage.recompute(context.serviceContext, body), context);
}

export async function handleListTestingDefects(request: NextRequest, context: PlatformApiRequestContext) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.defects.list(context.serviceContext), context);
}

export async function handleGetTestingDefect(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "defectId", defectIdParamSchema)) as DefectLinkId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.defects.get(context.serviceContext, id), context.tracing);
}

export async function handleCreateTestingDefect(request: NextRequest, context: PlatformApiRequestContext) {
  const body = await parseJsonBody(request, defectCreateBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  const input = withTenant(body, context) as unknown as Parameters<TestingDefectService["create"]>[1];
  return jsonDataResponse(await gateway.testing.defects.create(context.serviceContext, input), context.tracing, { status: 201 });
}

export async function handleUpdateTestingDefect(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "defectId", defectIdParamSchema)) as DefectLinkId;
  const body = await parseJsonBody(request, defectUpdateBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.defects.update(context.serviceContext, id, body as unknown as Parameters<TestingDefectService["update"]>[2]), context.tracing);
}

export async function handleArchiveTestingDefect(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "defectId", defectIdParamSchema)) as DefectLinkId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.defects.archive(context.serviceContext, id), context.tracing);
}

export async function handleLinkTestingDefect(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "defectId", defectIdParamSchema)) as DefectLinkId;
  const body = await parseJsonBody(request, defectLinkBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.defects.link(context.serviceContext, id, body.entityKind, body.entityId), context.tracing);
}

export async function handleSummarizeTestingQuality(request: NextRequest, context: PlatformApiRequestContext) {
  const scope = parseQuery(qualityScopeQuerySchema, request.nextUrl.searchParams) as QualityScope;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.quality.summarize(context.serviceContext, scope), context.tracing);
}

export async function handleTestingQualityTrends(request: NextRequest, context: PlatformApiRequestContext) {
  const query = parseQuery(qualityTrendsQuerySchema as unknown as z.ZodType<{ readonly baselineLabel?: string; readonly currentLabel?: string; readonly baselineMetrics?: Readonly<Record<string, number>>; readonly currentMetrics?: Readonly<Record<string, number>> }>, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  if (query.baselineMetrics && query.currentMetrics) {
    return jsonDataResponse(await gateway.testing.quality.compareWindows(context.serviceContext, { label: query.baselineLabel ?? "baseline", metrics: query.baselineMetrics }, { label: query.currentLabel ?? "current", metrics: query.currentMetrics }), context.tracing);
  }
  return collection(await gateway.testing.quality.listSnapshots(context.serviceContext), context);
}

export async function handleTestingQualityRegression(request: NextRequest, context: PlatformApiRequestContext) {
  const query = parseQuery(qualityRegressionQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.quality.compareSnapshots(context.serviceContext, query.baselineSnapshotId, query.currentSnapshotId), context.tracing);
}

export async function handleTestingQualityRisk(_request: NextRequest, context: PlatformApiRequestContext): Promise<never> {
  return unsupportedRisk(context);
}

export async function handleReleaseReadiness(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const releaseId = (await param(routeContext, "releaseId", releaseIdParamSchema));
  const query = parseQuery(releaseReadinessQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const result = query.scope === "certification"
    ? await gateway.testing.releaseReadiness.calculateForCertification(context.serviceContext, releaseId as CertificationRecordId)
    : await gateway.testing.releaseReadiness.calculateForPlan(context.serviceContext, releaseId as TestPlanId);
  return jsonDataResponse({ ...result, isDecision: false as const }, context.tracing);
}

export async function handleListTestingCertifications(request: NextRequest, context: PlatformApiRequestContext) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.certification.list(context.serviceContext), context);
}

export async function handleGetTestingCertification(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "certificationId", certificationIdParamSchema)) as CertificationRecordId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.certification.get(context.serviceContext, id), context.tracing);
}

export async function handleCreateTestingCertification(request: NextRequest, context: PlatformApiRequestContext) {
  const body = await parseJsonBody(request, certificationCreateBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  const input = withTenant({ ...body, gateIds: body.gateIds ?? [], approvalIds: body.approvalIds ?? [] }, context) as unknown as Parameters<TestingCertificationService["create"]>[1];
  return jsonDataResponse(await gateway.testing.certification.create(context.serviceContext, input), context.tracing, { status: 201 });
}

async function certificationId(routeContext?: RouteContext): Promise<CertificationRecordId> {
  return (await param(routeContext, "certificationId", certificationIdParamSchema)) as CertificationRecordId;
}

export async function handleArchiveTestingCertification(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseOptionalJsonBody(request, certificationReasonBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.certification.archive(context.serviceContext, await certificationId(routeContext), body.reason), context.tracing);
}

export async function handlePrepareTestingCertification(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseJsonBody(request, certificationPrepareBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  if (body.mode === "plan") {
    return jsonDataResponse(await gateway.testing.certification.prepareForPlan(context.serviceContext, body.planId as TestPlanId), context.tracing);
  }
  return jsonDataResponse(await gateway.testing.certification.prepareForCertification(context.serviceContext, await certificationId(routeContext)), context.tracing);
}

export async function handleEvaluateTestingCertificationGates(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.certification.evaluateGates(context.serviceContext, await certificationId(routeContext)), context);
}

export async function handleGetTestingCertificationRecommendation(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.certification.getRecommendation(context.serviceContext, await certificationId(routeContext)), context.tracing);
}

export async function handleStartTestingCertificationReview(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseOptionalJsonBody(request, certificationReasonBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.certification.startReview(context.serviceContext, await certificationId(routeContext), body.reason), context.tracing);
}

export async function handleRequestTestingCertificationChanges(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseJsonBody(request, certificationRequiredReasonBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.certification.requestChanges(context.serviceContext, await certificationId(routeContext), body.reason), context.tracing);
}

export async function handleSubmitTestingCertificationForApproval(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseOptionalJsonBody(request, certificationReasonBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.certification.submitForApproval(context.serviceContext, await certificationId(routeContext), body.reason), context.tracing);
}

export async function handleApproveTestingCertification(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseOptionalJsonBody(request, certificationReasonBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.certification.approve(context.serviceContext, await certificationId(routeContext), body.reason), context.tracing);
}

export async function handleConditionallyApproveTestingCertification(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseJsonBody(request, certificationConditionalApproveBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.certification.conditionallyApprove(context.serviceContext, await certificationId(routeContext), body.conditions), context.tracing);
}

export async function handleRejectTestingCertification(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseJsonBody(request, certificationRequiredReasonBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.certification.reject(context.serviceContext, await certificationId(routeContext), body.reason), context.tracing);
}

export async function handleExpireTestingCertification(request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const body = await parseOptionalJsonBody(request, certificationReasonBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.certification.expire(context.serviceContext, await certificationId(routeContext), body.reason), context.tracing);
}

export async function handleListTestingCertificationAudit(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.certification.listAudit(context.serviceContext, await certificationId(routeContext)), context);
}

export async function handleListTestingApprovals(request: NextRequest, context: PlatformApiRequestContext) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.approvals.list(context.serviceContext), context);
}

export async function handleGetTestingApproval(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "approvalId", approvalIdParamSchema)) as ApprovalId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.approvals.get(context.serviceContext, id), context.tracing);
}

export async function handleListTestingApprovalHistory(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "approvalId", approvalIdParamSchema)) as ApprovalId;
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.approvals.listHistory(context.serviceContext, id), context);
}

export async function handleListTestingTraceability(request: NextRequest, context: PlatformApiRequestContext) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  return collection(await gateway.testing.traceability.listLinks(context.serviceContext), context);
}

export async function handleCreateTestingTraceability(request: NextRequest, context: PlatformApiRequestContext) {
  const body = await parseJsonBody(request, traceabilityCreateBodySchema, PLATFORM_API_MAX_BODY_BYTES);
  const gateway = await getPlatformServiceGateway();
  const input = withTenant(body, context) as unknown as Parameters<TestingTraceabilityService["createLink"]>[1];
  return jsonDataResponse(await gateway.testing.traceability.createLink(context.serviceContext, input), context.tracing, { status: 201 });
}

export async function handleRemoveTestingTraceability(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const id = (await param(routeContext, "relationshipId", relationshipIdParamSchema)) as TraceabilityLinkId;
  const gateway = await getPlatformServiceGateway();
  await gateway.testing.traceability.removeLink(context.serviceContext, id);
  return jsonDataResponse({ removed: true, id }, context.tracing);
}

export async function handleGetTestingTraceabilityForResource(_request: NextRequest, context: PlatformApiRequestContext, routeContext?: RouteContext) {
  const resourceType = await param(routeContext, "resourceType", traceabilityResourceTypeParamSchema);
  const resourceId = await param(routeContext, "resourceId", resourceIdParamSchema);
  const gateway = await getPlatformServiceGateway();
  if (resourceType === "requirement") {
    return jsonDataResponse(await gateway.testing.traceability.getMatrixForRequirement(context.serviceContext, resourceId as RequirementId), context.tracing);
  }
  return collection(await gateway.testing.traceability.listMatrix(context.serviceContext), context);
}

export async function handleGetTestingDashboardSummary(_request: NextRequest, context: PlatformApiRequestContext) {
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(await gateway.testing.dashboard.getDashboardSummary(context.serviceContext), context.tracing);
}

export {
  handleGetPipelineRepository,
  handleListPipelineWorkflows,
  handleGetPipelineWorkflow,
  handleListLivePipelineRuns,
  handleGetLivePipelineRun,
  handleListLivePipelineJobs,
  handleGetLivePipelineJob,
  handleListLivePipelineSteps,
  handleListLivePipelineArtifacts,
  handleGetLivePipelineSummary,
  handleListSorPipelines,
  handleGetSorPipeline,
  handleListSorPipelineRuns,
  handleGetSorPipelineRun,
  handleGetSorPipelineRunLinks,
  handleListSorPipelineRunJobs,
  handleListSorPipelineRunStages,
  handleListPipelineProviders,
  handleImportPipelineFromProvider,
} from "./testing-pipelines";

export {
  handleGetEngineeringQualityScore,
  handlePostEngineeringQualityScore,
  handleGetEngineeringHealth,
  handlePostEngineeringHealth,
  handleListEngineeringSnapshots,
  handleComputeEngineeringSnapshot,
  handleGetEngineeringSnapshot,
  handleListEngineeringTrends,
  handleBuildEngineeringTrend,
  handleListEngineeringBenchmarks,
  handleCompareEngineeringBenchmark,
  handleListEngineeringBaselines,
  handleListEngineeringHistorical,
  handleGetEngineeringRiskSummary,
} from "./testing-engineering-intelligence";
