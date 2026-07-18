/**
 * ManualTestingSearchMapper — manual testing domain → SearchEntityDraft (APZSEARCH-013).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";
import type {
  Approval,
  DefectLink,
  Evidence,
  ManualExecution,
  Requirement,
  TestCase,
  TestPlan,
  TestRun,
  TestStep,
  TestSuite,
} from "@apzhub/testing-contracts";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  assertPlatformEntityId,
  assertTenant,
  navigationTarget,
  permissionTokens,
  resolveTestingClassification,
  type TestingSearchMappableEntity,
  type TestingSearchMappingExtras,
} from "./shared";

export type ManualTestingMappableEntity = Extract<
  TestingSearchMappableEntity,
  {
    readonly entityType:
      | "test_plan"
      | "test_suite"
      | "test_case"
      | "test_execution"
      | "test_run"
      | "execution_step"
      | "evidence"
      | "approval"
      | "requirement"
      | "defect";
  }
>;

export class ManualTestingSearchMapper {
  map(
    context: TestingSearchPublicationContext,
    input: ManualTestingMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "test_plan":
        return this.mapTestPlan(context, input.entity, input.extras);
      case "test_suite":
        return this.mapTestSuite(context, input.entity, input.extras);
      case "test_case":
        return this.mapTestCase(context, input.entity, input.extras);
      case "test_execution":
        return this.mapTestExecution(context, input.entity, input.extras);
      case "test_run":
        return this.mapTestRun(context, input.entity, input.extras);
      case "execution_step":
        return this.mapExecutionStep(context, input.entity, input.extras);
      case "evidence":
        return this.mapEvidence(context, input.entity, input.extras);
      case "approval":
        return this.mapApproval(context, input.entity, "approval", input.extras);
      case "requirement":
        return this.mapRequirement(context, input.entity, input.extras);
      case "defect":
        return this.mapDefect(context, input.entity, input.extras);
    }
  }

  mapTestPlan(
    context: TestingSearchPublicationContext,
    plan: TestPlan,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(plan.id, "test_plan.id");
    assertTenant(plan.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: plan.status,
    });
    return {
      entityId: plan.id,
      entityType: "test_plan",
      title: plan.name,
      summary: plan.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, plan.status, classification),
      metadata: {
        key: plan.key,
        status: plan.status,
        ...(plan.releaseLabel ? { releaseLabel: plan.releaseLabel } : {}),
        ...(plan.ownerId ? { ownerUserId: plan.ownerId } : {}),
        ...(plan.versionNumber !== undefined
          ? { versionNumber: String(plan.versionNumber) }
          : {}),
        suiteCount: String(plan.suiteIds.length),
        requirementCount: String(plan.requirementIds.length),
      },
      keywords: [plan.name, plan.key, plan.status],
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      navigationTarget: navigationTarget("test_plan", plan.id),
      sourceId: "testing:test_plan",
      ownerUserId: plan.ownerId ?? plan.createdBy ?? context.actorUserId,
      version:
        plan.versionNumber !== undefined ? String(plan.versionNumber) : undefined,
    };
  }

  mapTestSuite(
    context: TestingSearchPublicationContext,
    suite: TestSuite,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(suite.id, "test_suite.id");
    assertTenant(suite.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: suite.status,
    });
    return {
      entityId: suite.id,
      entityType: "test_suite",
      title: suite.name,
      summary: suite.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, suite.status, classification),
      metadata: {
        key: suite.key,
        status: suite.status,
        caseCount: String(suite.caseIds.length),
        ...(suite.ownerId ? { ownerUserId: suite.ownerId } : {}),
        ...(suite.versionNumber !== undefined
          ? { versionNumber: String(suite.versionNumber) }
          : {}),
      },
      keywords: [suite.name, suite.key, suite.status],
      createdAt: suite.createdAt,
      updatedAt: suite.updatedAt,
      navigationTarget: navigationTarget("test_suite", suite.id),
      sourceId: "testing:test_suite",
      ownerUserId: suite.ownerId ?? suite.createdBy ?? context.actorUserId,
      version:
        suite.versionNumber !== undefined ? String(suite.versionNumber) : undefined,
    };
  }

  mapTestCase(
    context: TestingSearchPublicationContext,
    testCase: TestCase,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(testCase.id, "test_case.id");
    assertTenant(testCase.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      severity: testCase.riskLevel,
      status: testCase.status,
    });
    return {
      entityId: testCase.id,
      entityType: "test_case",
      title: testCase.title,
      summary: testCase.description ?? testCase.expectedResultsSummary,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, testCase.status, classification),
      metadata: {
        key: testCase.key,
        status: testCase.status,
        priority: testCase.priority,
        ...(testCase.riskLevel ? { severity: testCase.riskLevel } : {}),
        ...(testCase.ownerId ? { ownerUserId: testCase.ownerId } : {}),
        ...(testCase.versionNumber !== undefined
          ? { versionNumber: String(testCase.versionNumber) }
          : {}),
      },
      keywords: [
        testCase.title,
        testCase.key,
        testCase.status,
        testCase.priority,
        ...(testCase.tags ?? []),
      ],
      createdAt: testCase.createdAt,
      updatedAt: testCase.updatedAt,
      navigationTarget: navigationTarget("test_case", testCase.id),
      sourceId: "testing:test_case",
      ownerUserId: testCase.ownerId ?? testCase.createdBy ?? context.actorUserId,
      version:
        testCase.versionNumber !== undefined
          ? String(testCase.versionNumber)
          : undefined,
    };
  }

  mapTestExecution(
    context: TestingSearchPublicationContext,
    execution: ManualExecution,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(execution.id, "test_execution.id");
    assertTenant(execution.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: execution.status,
    });
    const title = extras?.title ?? `Execution ${execution.id.slice(0, 12)}`;
    return {
      entityId: execution.id,
      entityType: "test_execution",
      title,
      summary: execution.blockReason,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, execution.status, classification),
      metadata: {
        status: execution.status,
        caseId: execution.caseId,
        sessionId: execution.sessionId,
        ...(execution.overallResult ? { overallResult: execution.overallResult } : {}),
        ...(execution.approvalState ? { approvalState: execution.approvalState } : {}),
        ...(execution.assigneeId ? { assigneeId: execution.assigneeId } : {}),
      },
      keywords: [title, execution.status, execution.caseId],
      createdAt: execution.createdAt,
      updatedAt: execution.updatedAt,
      navigationTarget: navigationTarget("test_execution", execution.id),
      sourceId: "testing:test_execution",
      ownerUserId: execution.assigneeId ?? execution.testerId ?? context.actorUserId,
    };
  }

  mapTestRun(
    context: TestingSearchPublicationContext,
    run: TestRun,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(run.id, "test_run.id");
    assertTenant(run.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: run.status,
    });
    const title = extras?.title ?? `Run ${run.id.slice(0, 12)}`;
    return {
      entityId: run.id,
      entityType: "test_run",
      title,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, run.status, classification),
      metadata: {
        status: run.status,
        kind: run.executionType,
        sessionId: run.sessionId,
        ...(run.caseId ? { caseId: run.caseId } : {}),
        ...(run.suiteId ? { suiteId: run.suiteId } : {}),
        evidenceCount: String(run.evidenceIds.length),
      },
      keywords: [title, run.status, run.executionType],
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
      navigationTarget: navigationTarget("test_run", run.id),
      sourceId: "testing:test_run",
      ownerUserId: run.createdBy ?? context.actorUserId,
    };
  }

  mapExecutionStep(
    context: TestingSearchPublicationContext,
    step: TestStep,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(step.id, "execution_step.id");
    const tenantId = extras?.tenantId ?? extras?.parentCase?.tenantId;
    if (!tenantId) {
      throw new Error("tenantId is required via extras when mapping execution_step");
    }
    assertTenant(tenantId, context);
    if (!extras?.classification && !context.classification) {
      throw new Error(
        "classification is required on context or extras for execution_step — fail-closed",
      );
    }
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title = extras?.title ?? `Step ${step.ordinal}: ${step.action.slice(0, 80)}`;
    return {
      entityId: step.id,
      entityType: "execution_step",
      title,
      summary: step.expectedResult?.slice(0, 280),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        caseId: step.caseId,
        ordinal: String(step.ordinal),
        ...(extras?.parentExecution ? { executionId: extras.parentExecution.id } : {}),
      },
      keywords: [title, step.caseId],
      createdAt: extras?.parentCase?.createdAt ?? new Date(0).toISOString(),
      updatedAt: extras?.parentCase?.updatedAt ?? new Date(0).toISOString(),
      navigationTarget: navigationTarget("execution_step", step.id),
      sourceId: "testing:execution_step",
      ownerUserId: context.actorUserId,
    };
  }

  mapEvidence(
    context: TestingSearchPublicationContext,
    evidence: Evidence,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(evidence.id, "evidence.id");
    assertTenant(evidence.tenantId, context);
    // NEVER storageRef, checksum, contentHash, url, bytes
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: evidence.lifecycleStatus,
    });
    return {
      entityId: evidence.id,
      entityType: "evidence",
      title: evidence.title,
      summary: evidence.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        evidence.lifecycleStatus,
        classification,
      ),
      metadata: {
        type: evidence.type,
        ...(evidence.mimeType || evidence.contentType
          ? { mimeType: evidence.mimeType ?? evidence.contentType ?? "" }
          : {}),
        checksumPresent: evidence.checksum || evidence.contentHash ? "true" : "false",
        sizePresent: evidence.sizeBytes !== undefined ? "true" : "false",
        ...(evidence.lifecycleStatus
          ? { lifecycleStatus: evidence.lifecycleStatus }
          : {}),
        ...(evidence.verificationState
          ? { verificationState: evidence.verificationState }
          : {}),
        ...(evidence.runId ? { runId: evidence.runId } : {}),
        ...(evidence.executionId ? { executionId: evidence.executionId } : {}),
        ...(evidence.stepId ? { stepId: evidence.stepId } : {}),
      },
      keywords: [evidence.title, evidence.type],
      createdAt: evidence.createdAt,
      updatedAt: evidence.updatedAt,
      navigationTarget: navigationTarget("evidence", evidence.id),
      sourceId: "testing:evidence",
      ownerUserId: evidence.authorUserId ?? evidence.createdBy ?? context.actorUserId,
    };
  }

  mapApproval(
    context: TestingSearchPublicationContext,
    approval: Approval,
    entityType: "approval" | "certification_approval",
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(approval.id, `${entityType}.id`);
    assertTenant(approval.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: approval.status,
    });
    const title =
      extras?.title ?? `Approval ${approval.status} (${approval.id.slice(0, 12)})`;
    return {
      entityId: approval.id,
      entityType,
      title,
      summary: approval.comments?.slice(0, 280),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, approval.status, classification),
      metadata: {
        status: approval.status,
        certificationRecordId: approval.certificationRecordId,
        ...(approval.gateId ? { gateId: approval.gateId } : {}),
        ...(approval.subjectKind ? { subjectKind: approval.subjectKind } : {}),
        ...(approval.subjectId ? { subjectId: approval.subjectId } : {}),
        ...(approval.decidedAt ? { decidedAt: approval.decidedAt } : {}),
        ...(approval.decidedByUserId
          ? { decidedByUserId: approval.decidedByUserId }
          : {}),
      },
      keywords: [title, approval.status],
      createdAt: approval.createdAt,
      updatedAt: approval.updatedAt,
      navigationTarget: navigationTarget(entityType, approval.id),
      sourceId: `testing:${entityType}`,
      ownerUserId:
        approval.approverUserId ?? approval.authorUserId ?? context.actorUserId,
    };
  }

  mapRequirement(
    context: TestingSearchPublicationContext,
    requirement: Requirement,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(requirement.id, "requirement.id");
    assertTenant(requirement.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: requirement.priority,
    });
    return {
      entityId: requirement.id,
      entityType: "requirement",
      title: requirement.title,
      summary: requirement.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        requirement.priority,
        classification,
      ),
      metadata: {
        key: requirement.key,
        priority: requirement.priority,
        ...(requirement.ownerId ? { ownerUserId: requirement.ownerId } : {}),
      },
      keywords: [
        requirement.title,
        requirement.key,
        requirement.priority,
        ...(requirement.tags ?? []),
      ],
      createdAt: requirement.createdAt,
      updatedAt: requirement.updatedAt,
      navigationTarget: navigationTarget("requirement", requirement.id),
      sourceId: "testing:requirement",
      ownerUserId: requirement.ownerId ?? requirement.createdBy ?? context.actorUserId,
    };
  }

  mapDefect(
    context: TestingSearchPublicationContext,
    defect: DefectLink,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(defect.id, "defect.id");
    assertTenant(defect.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      severity: defect.severity,
      status: defect.status,
    });
    const title =
      defect.summary?.trim() ||
      extras?.title ||
      `Defect ${defect.internalRef ?? defect.externalRef ?? defect.id.slice(0, 12)}`;
    return {
      entityId: defect.id,
      entityType: "defect",
      title,
      summary: defect.summary,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, defect.status, classification),
      metadata: {
        status: defect.status,
        providerKind: defect.providerKind,
        ...(defect.severity ? { severity: defect.severity } : {}),
        ...(defect.priority ? { priority: defect.priority } : {}),
        ...(defect.internalRef ? { internalRef: defect.internalRef } : {}),
        ...(defect.externalRef ? { externalRef: defect.externalRef } : {}),
        ...(defect.ownerUserId ? { ownerUserId: defect.ownerUserId } : {}),
        ...(defect.releaseLabel ? { releaseLabel: defect.releaseLabel } : {}),
      },
      keywords: [title, defect.status, defect.providerKind],
      createdAt: defect.createdAt,
      updatedAt: defect.updatedAt,
      navigationTarget: navigationTarget("defect", defect.id),
      sourceId: "testing:defect",
      ownerUserId: defect.ownerUserId ?? defect.createdBy ?? context.actorUserId,
    };
  }
}
