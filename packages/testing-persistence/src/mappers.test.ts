import { describe, expect, it } from "vitest";

import {
  approvalHistoryToRow,
  approvalToRow,
  auditToRow,
  automationDefinitionToRow,
  certificationToRow,
  configurationToRow,
  coverageToRow,
  dateFromIso,
  evidenceToRow,
  executionHistoryToRow,
  executionSessionToRow,
  isoFromDate,
  manualExecutionToRow,
  metaFromRow,
  registryEntryToRow,
  regressionSetToRow,
  releaseReadinessToRow,
  requirementToRow,
  riskToRow,
  rowToApproval,
  rowToApprovalHistory,
  rowToAudit,
  rowToAutomationDefinition,
  rowToCertification,
  rowToConfiguration,
  rowToCoverage,
  rowToEvidence,
  rowToExecutionHistory,
  rowToExecutionSession,
  rowToManualExecution,
  rowToRegistryEntry,
  rowToRegressionSet,
  rowToReleaseReadiness,
  rowToRequirement,
  rowToRisk,
  rowToTestCase,
  rowToTestCaseVersion,
  rowToTestPlan,
  rowToTestPlanVersion,
  rowToTestStep,
  rowToTestSuite,
  rowToTestSuiteVersion,
  rowToTraceabilityLink,
  rowToWorkItem,
  testCaseToRow,
  testCaseVersionToRow,
  testPlanToRow,
  testPlanVersionToRow,
  testStepToRow,
  testSuiteToRow,
  testSuiteVersionToRow,
  traceabilityLinkToRow,
  workItemToRow,
} from "./repositories/mappers/row-mappers";

describe("row mappers", () => {
  it("handles iso/date helpers and metaFromRow nulls", () => {
    expect(isoFromDate(null)).toBeUndefined();
    expect(isoFromDate(undefined)).toBeUndefined();
    expect(isoFromDate("2026-01-01T00:00:00.000Z")).toBe("2026-01-01T00:00:00.000Z");
    expect(isoFromDate(new Date("2026-01-01T00:00:00.000Z"))).toBe(
      "2026-01-01T00:00:00.000Z",
    );
    expect(dateFromIso(undefined)).toBeNull();
    expect(dateFromIso("")).toBeNull();
    expect(dateFromIso("2026-01-01T00:00:00.000Z")).toBeInstanceOf(Date);

    const meta = metaFromRow({
      id: "m1",
      tenantId: "t1",
      organisationId: null,
      revision: 1,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      createdBy: null,
      updatedBy: null,
      archivedAt: null,
    });
    expect(meta.organisationId).toBeUndefined();
    expect(meta.createdBy).toBeUndefined();
    expect(meta.archivedAt).toBeUndefined();
  });

  it("round-trips requirement rows", () => {
    const record = {
      id: "req-1",
      tenantId: "t1",
      organisationId: "o1",
      key: "REQ-1",
      title: "Title",
      description: "Desc",
      priority: "high" as const,
      tags: ["a"],
      workItemRefs: [
        {
          kind: "story" as const,
          projectRefId: "p1",
          workItemId: "w1" as never,
        },
      ],
      riskIds: [] as readonly string[],
      revision: 2,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      createdBy: "u1",
      updatedBy: "u2",
    };
    const row = requirementToRow(record);
    const back = rowToRequirement(row);
    expect(back.key).toBe("REQ-1");
    expect(back.revision).toBe(2);
    expect(back.organisationId).toBe("o1");
    expect(back.tags).toEqual(["a"]);

    const sparse = rowToRequirement(
      requirementToRow({
        id: "req-2",
        tenantId: "t1",
        key: "REQ-2",
        title: "Sparse",
        priority: "low",
        tags: [],
        workItemRefs: [],
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(sparse.organisationId).toBeUndefined();
    expect(sparse.description).toBeUndefined();
  });

  it("round-trips configuration, history, and audit", () => {
    const configRow = configurationToRow({
      id: "c1",
      tenantId: "t1",
      configKey: "default",
      configJson: { a: 1 },
      revision: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(rowToConfiguration(configRow).configKey).toBe("default");
    expect(
      rowToConfiguration({
        ...configRow,
        configJson: null,
      }).configJson,
    ).toEqual({});

    const historyRow = executionHistoryToRow({
      id: "h1",
      tenantId: "t1",
      sessionId: "s1",
      eventType: "started",
      occurredAt: "2026-01-01T00:00:00.000Z",
      summary: "ok",
      details: { x: true },
    });
    expect(rowToExecutionHistory(historyRow).sessionId).toBe("s1");
    expect(
      rowToExecutionHistory({
        ...historyRow,
        organisationId: null,
        actorUserId: null,
        correlationId: null,
        details: null,
      }).details,
    ).toEqual({});

    const auditRow = auditToRow({
      id: "a1",
      tenantId: "t1",
      occurredAt: "2026-01-01T00:00:00.000Z",
      action: "created",
      entityKind: "requirement",
      entityId: "r1",
      summary: "created",
      details: { k: "v" },
    });
    expect(rowToAudit(auditRow).action).toBe("created");
    expect(
      rowToAudit({
        ...auditRow,
        organisationId: null,
        actorUserId: null,
        correlationId: null,
        details: null,
      }).details,
    ).toEqual({});
  });

  it("round-trips plan, risk, evidence, and manual execution", () => {
    const plan = rowToTestPlan(
      testPlanToRow({
        id: "p1",
        tenantId: "t1",
        key: "PLAN-1",
        name: "Plan",
        status: "draft",
        suiteIds: [],
        requirementIds: [],
        riskIds: [],
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(plan.key).toBe("PLAN-1");
    expect(plan.releaseLabel).toBeUndefined();

    const risk = rowToRisk(
      riskToRow({
        id: "r1",
        tenantId: "t1",
        key: "RISK-1",
        title: "Risk",
        level: "high",
        requirementIds: [],
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(risk.level).toBe("high");
    expect(risk.severity).toBeUndefined();

    const evidence = rowToEvidence(
      evidenceToRow({
        id: "e1",
        tenantId: "t1",
        type: "screenshot",
        title: "Shot",
        storageRef: "ref",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(evidence.type).toBe("screenshot");
    expect(evidence.relationships).toEqual([]);

    const exec = rowToManualExecution(
      manualExecutionToRow({
        id: "m1",
        tenantId: "t1",
        sessionId: "s1",
        caseId: "c1",
        status: "planned",
        comments: [{ id: "c", authorUserId: "u", body: "hi", createdAt: "2026-01-01T00:00:00.000Z" }],
        stepActuals: [{ stepId: "st1", status: "pass" }],
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(exec.stepActuals[0]?.stepId).toBe("st1");

    const sparseExec = rowToManualExecution(
      manualExecutionToRow({
        id: "m2",
        tenantId: "t1",
        sessionId: "s1",
        caseId: "c1",
        status: "planned",
        comments: [],
        stepActuals: [],
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(sparseExec.assigneeId).toBeUndefined();
    expect(sparseExec.overallResult).toBeUndefined();
  });

  it("round-trips version and approval history mappers", () => {
    const caseVersion = rowToTestCaseVersion(
      testCaseVersionToRow({
        id: "cv1",
        tenantId: "t1",
        caseId: "c1",
        versionNumber: 2,
        reason: "edited",
        snapshot: { a: 1 },
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(caseVersion.versionNumber).toBe(2);
    expect(
      rowToTestCaseVersion({
        ...testCaseVersionToRow({
          id: "cv2",
          tenantId: "t1",
          caseId: "c1",
          versionNumber: 1,
          reason: "created",
          snapshot: {},
          revision: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
        snapshot: null,
        changedByUserId: null,
        changeSummary: null,
      }).snapshot,
    ).toEqual({});

    const planVersion = rowToTestPlanVersion(
      testPlanVersionToRow({
        id: "pv1",
        tenantId: "t1",
        planId: "p1",
        versionNumber: 1,
        reason: "created",
        snapshot: {},
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(planVersion.planId).toBe("p1");

    const suiteVersion = rowToTestSuiteVersion(
      testSuiteVersionToRow({
        id: "sv1",
        tenantId: "t1",
        suiteId: "s1",
        versionNumber: 3,
        reason: "cloned",
        snapshot: { name: "S" },
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(suiteVersion.suiteId).toBe("s1");

    const approval = rowToApproval(
      approvalToRow({
        id: "a1",
        tenantId: "t1",
        certificationRecordId: "cert-1",
        status: "pending",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(approval.certificationRecordId).toBe("cert-1");

    const richApproval = rowToApproval(
      approvalToRow({
        id: "a2",
        tenantId: "t1",
        organisationId: "o1",
        certificationRecordId: "cert-1",
        status: "approved",
        signatureJson: { sig: true },
        witnessesJson: [{ name: "w" }],
        historyJson: [{ event: "decided" }],
        decidedAt: "2026-01-02T00:00:00.000Z",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(richApproval.signatureJson).toEqual({ sig: true });
    expect(richApproval.witnessesJson).toHaveLength(1);

    const history = rowToApprovalHistory(
      approvalHistoryToRow({
        id: "ah1",
        tenantId: "t1",
        approvalId: "a1",
        eventType: "requested",
        occurredAt: "2026-01-01T00:00:00.000Z",
        summary: "ok",
        details: {},
        fromStatus: "pending",
        toStatus: "approved",
      }),
    );
    expect(history.fromStatus).toBe("pending");
    expect(
      rowToApprovalHistory({
        ...approvalHistoryToRow({
          id: "ah2",
          tenantId: "t1",
          approvalId: "a1",
          eventType: "requested",
          occurredAt: "2026-01-01T00:00:00.000Z",
          summary: "ok",
          details: {},
        }),
        details: null,
        fromStatus: null,
        toStatus: null,
      }).fromStatus,
    ).toBeUndefined();

    const link = rowToTraceabilityLink(
      traceabilityLinkToRow({
        id: "l1",
        tenantId: "t1",
        type: "covers",
        sourceKind: "test_case",
        sourceId: "c1",
        targetKind: "requirement",
        targetId: "r1",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(link.type).toBe("covers");
    expect(link.notes).toBeUndefined();
  });

  it("round-trips workItem with optional and null fields", () => {
    const full = rowToWorkItem(
      workItemToRow({
        id: "wi-1",
        tenantId: "t1",
        organisationId: "o1",
        kind: "story",
        key: "WI-1",
        title: "Item",
        description: "Desc",
        projectRefId: "p1",
        externalWorkItemId: "ext-1",
        status: "active",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        createdBy: "u1",
        updatedBy: "u1",
      }),
    );
    expect(full.projectRefId).toBe("p1");
    expect(full.externalWorkItemId).toBe("ext-1");

    const sparse = rowToWorkItem(
      workItemToRow({
        id: "wi-2",
        tenantId: "t1",
        kind: "task",
        key: "WI-2",
        title: "Sparse",
        status: "active",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(sparse.organisationId).toBeUndefined();
    expect(sparse.description).toBeUndefined();
    expect(sparse.projectRefId).toBeUndefined();
  });

  it("round-trips testSuite with optional and null fields", () => {
    const full = rowToTestSuite(
      testSuiteToRow({
        id: "s1",
        tenantId: "t1",
        organisationId: "o1",
        key: "SUITE-1",
        name: "Suite",
        description: "Desc",
        status: "ready",
        isRegression: true,
        planIds: ["p1"],
        caseIds: ["c1"],
        ownerId: "u1",
        parentSuiteId: "parent",
        sortOrder: 3,
        versionNumber: 2,
        groupKey: "g1",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(full.isRegression).toBe(true);
    expect(full.groupKey).toBe("g1");
    expect(full.planIds).toEqual([]);

    const sparse = rowToTestSuite(
      testSuiteToRow({
        id: "s2",
        tenantId: "t1",
        key: "SUITE-2",
        name: "Sparse",
        status: "draft",
        isRegression: false,
        planIds: [],
        caseIds: [],
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(sparse.description).toBeUndefined();
    expect(sparse.ownerId).toBeUndefined();
    expect(sparse.parentSuiteId).toBeUndefined();
    expect(sparse.groupKey).toBeUndefined();
    expect(sparse.sortOrder).toBe(0);
  });

  it("round-trips testCase with optional arrays and nulls", () => {
    const full = rowToTestCase(
      testCaseToRow({
        id: "c1",
        tenantId: "t1",
        organisationId: "o1",
        key: "CASE-1",
        title: "Case",
        description: "Desc",
        status: "ready",
        priority: "high",
        tags: ["a", "b"],
        estimatedMinutes: 30,
        suiteIds: ["s1"],
        requirementIds: ["r1"],
        stepIds: ["st1"],
        preconditions: "pre",
        postconditions: "post",
        expectedResultsSummary: "ok",
        templateKey: "tmpl",
        parameters: [{ key: "p", label: "P", defaultValue: "1", required: true }],
        components: ["comp"],
        ownerId: "u1",
        reviewerId: "u2",
        versionNumber: 2,
        parentCaseId: "parent",
        riskLevel: "critical",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(full.parameters).toHaveLength(1);
    expect(full.components).toEqual(["comp"]);
    expect(full.riskLevel).toBe("critical");

    const sparse = rowToTestCase(
      testCaseToRow({
        id: "c2",
        tenantId: "t1",
        key: "CASE-2",
        title: "Sparse",
        status: "draft",
        priority: "medium",
        tags: [],
        suiteIds: [],
        requirementIds: [],
        stepIds: [],
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(sparse.description).toBeUndefined();
    expect(sparse.estimatedMinutes).toBeUndefined();
    expect(sparse.parameters).toEqual([]);
    expect(sparse.components).toEqual([]);
    expect(sparse.riskLevel).toBeUndefined();

    const nullArrays = rowToTestCase({
      ...testCaseToRow({
        id: "c3",
        tenantId: "t1",
        key: "CASE-3",
        title: "Nulls",
        status: "draft",
        priority: "low",
        tags: [],
        suiteIds: [],
        requirementIds: [],
        stepIds: [],
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
      tags: null,
      parameters: null,
      components: null,
    });
    expect(nullArrays.tags).toEqual([]);
    expect(nullArrays.parameters).toEqual([]);
  });

  it("round-trips testStep with optional dataHint and archive", () => {
    const full = rowToTestStep(
      testStepToRow({
        id: "st1",
        tenantId: "t1",
        organisationId: "o1",
        caseId: "c1",
        ordinal: 1,
        action: "Click",
        expectedResult: "Opens",
        dataHint: "hint",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        archivedAt: "2026-01-02T00:00:00.000Z",
      }),
    );
    expect(full.dataHint).toBe("hint");
    expect(full.archivedAt).toBe("2026-01-02T00:00:00.000Z");

    const sparse = rowToTestStep(
      testStepToRow({
        id: "st2",
        tenantId: "t1",
        caseId: "c1",
        ordinal: 0,
        action: "Act",
        expectedResult: "Ok",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(sparse.organisationId).toBeUndefined();
    expect(sparse.dataHint).toBeUndefined();
    expect(sparse.archivedAt).toBeUndefined();
  });

  it("round-trips regressionSet with empty suiteIds", () => {
    const full = rowToRegressionSet(
      regressionSetToRow({
        id: "rs1",
        tenantId: "t1",
        organisationId: "o1",
        key: "REG-1",
        name: "Reg",
        description: "Desc",
        planId: "p1",
        suiteIds: ["s1", "s2"],
        ownerId: "u1",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(full.suiteIds).toEqual(["s1", "s2"]);
    expect(full.planId).toBe("p1");

    const sparse = rowToRegressionSet(
      regressionSetToRow({
        id: "rs2",
        tenantId: "t1",
        key: "REG-2",
        name: "Sparse",
        suiteIds: [],
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(sparse.description).toBeUndefined();
    expect(sparse.planId).toBeUndefined();
    expect(sparse.ownerId).toBeUndefined();
    expect(sparse.suiteIds).toEqual([]);

    expect(
      rowToRegressionSet({
        ...regressionSetToRow({
          id: "rs3",
          tenantId: "t1",
          key: "REG-3",
          name: "Null suites",
          suiteIds: [],
          revision: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
        suiteIds: null,
      }).suiteIds,
    ).toEqual([]);
  });

  it("round-trips executionSession with optional timestamps", () => {
    const full = rowToExecutionSession(
      executionSessionToRow({
        id: "es1",
        tenantId: "t1",
        organisationId: "o1",
        planId: "p1",
        suiteId: "s1",
        executionType: "manual",
        status: "in_progress",
        startedAt: "2026-01-01T01:00:00.000Z",
        completedAt: "2026-01-01T02:00:00.000Z",
        assigneeId: "u1",
        notes: "note",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(full.startedAt).toBe("2026-01-01T01:00:00.000Z");
    expect(full.completedAt).toBe("2026-01-01T02:00:00.000Z");

    const sparse = rowToExecutionSession(
      executionSessionToRow({
        id: "es2",
        tenantId: "t1",
        executionType: "automated",
        status: "planned",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(sparse.planId).toBeUndefined();
    expect(sparse.suiteId).toBeUndefined();
    expect(sparse.startedAt).toBeUndefined();
    expect(sparse.assigneeId).toBeUndefined();
    expect(sparse.notes).toBeUndefined();
  });

  it("round-trips certification with empty gate/approval arrays", () => {
    const full = rowToCertification(
      certificationToRow({
        id: "cert-1",
        tenantId: "t1",
        organisationId: "o1",
        key: "CERT-1",
        name: "Cert",
        status: "certified",
        planId: "p1",
        productLabel: "Prod",
        releaseLabel: "1.0",
        gateIds: ["g1"],
        approvalIds: ["a1"],
        conditions: "ok",
        certifiedAt: "2026-01-03T00:00:00.000Z",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(full.gateIds).toEqual(["g1"]);
    expect(full.certifiedAt).toBe("2026-01-03T00:00:00.000Z");

    const sparse = rowToCertification(
      certificationToRow({
        id: "cert-2",
        tenantId: "t1",
        key: "CERT-2",
        name: "Sparse",
        status: "development_ready",
        gateIds: [],
        approvalIds: [],
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(sparse.planId).toBeUndefined();
    expect(sparse.productLabel).toBeUndefined();
    expect(sparse.conditions).toBeUndefined();
    expect(sparse.certifiedAt).toBeUndefined();

    expect(
      rowToCertification({
        ...certificationToRow({
          id: "cert-3",
          tenantId: "t1",
          key: "CERT-3",
          name: "Nulls",
          status: "development_ready",
          gateIds: [],
          approvalIds: [],
          revision: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
        gateIds: null,
        approvalIds: null,
      }).gateIds,
    ).toEqual([]);
  });

  it("round-trips releaseReadiness with empty blocking gates", () => {
    const full = rowToReleaseReadiness(
      releaseReadinessToRow({
        id: "rr1",
        tenantId: "t1",
        organisationId: "o1",
        certificationRecordId: "cert-1",
        status: "ready",
        summary: "Ready",
        blockingGateIds: ["g1"],
        assessedAt: "2026-01-01T00:00:00.000Z",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(full.blockingGateIds).toEqual(["g1"]);

    const sparse = rowToReleaseReadiness(
      releaseReadinessToRow({
        id: "rr2",
        tenantId: "t1",
        certificationRecordId: "cert-1",
        status: "not_ready",
        summary: "Blocked",
        blockingGateIds: [],
        assessedAt: "2026-01-01T00:00:00.000Z",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(sparse.blockingGateIds).toEqual([]);

    expect(
      rowToReleaseReadiness({
        ...releaseReadinessToRow({
          id: "rr3",
          tenantId: "t1",
          certificationRecordId: "cert-1",
          status: "not_ready",
          summary: "Null",
          blockingGateIds: [],
          assessedAt: "2026-01-01T00:00:00.000Z",
          revision: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
        blockingGateIds: null,
      }).blockingGateIds,
    ).toEqual([]);
  });

  it("round-trips coverage with optional subject refs", () => {
    const full = rowToCoverage(
      coverageToRow({
        id: "cov-1",
        tenantId: "t1",
        organisationId: "o1",
        kind: "requirement",
        subjectId: "subj-1",
        coveredCount: 2,
        totalCount: 4,
        percentage: 50,
        computedAt: "2026-01-01T00:00:00.000Z",
        planId: "p1",
        suiteId: "s1",
        requirementId: "r1",
        riskId: "risk-1",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(full.percentage).toBe(50);
    expect(full.planId).toBe("p1");

    const sparse = rowToCoverage(
      coverageToRow({
        id: "cov-2",
        tenantId: "t1",
        kind: "risk",
        subjectId: "subj-2",
        coveredCount: 0,
        totalCount: 0,
        percentage: 0,
        computedAt: "2026-01-01T00:00:00.000Z",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(sparse.planId).toBeUndefined();
    expect(sparse.suiteId).toBeUndefined();
    expect(sparse.requirementId).toBeUndefined();
    expect(sparse.riskId).toBeUndefined();
  });

  it("round-trips automationDefinition with empty config", () => {
    const full = rowToAutomationDefinition(
      automationDefinitionToRow({
        id: "ad1",
        tenantId: "t1",
        organisationId: "o1",
        key: "AUTO-1",
        name: "Auto",
        description: "Desc",
        automationType: "e2e",
        adapterSourceId: "adapter-1",
        caseId: "c1",
        suiteId: "s1",
        configJson: { timeout: 30 },
        status: "active",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(full.configJson).toEqual({ timeout: 30 });
    expect(full.adapterSourceId).toBe("adapter-1");

    const sparse = rowToAutomationDefinition(
      automationDefinitionToRow({
        id: "ad2",
        tenantId: "t1",
        key: "AUTO-2",
        name: "Sparse",
        automationType: "other",
        configJson: {},
        status: "active",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(sparse.description).toBeUndefined();
    expect(sparse.caseId).toBeUndefined();
    expect(sparse.suiteId).toBeUndefined();

    expect(
      rowToAutomationDefinition({
        ...automationDefinitionToRow({
          id: "ad3",
          tenantId: "t1",
          key: "AUTO-3",
          name: "Null cfg",
          automationType: "api",
          configJson: {},
          status: "active",
          revision: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
        configJson: null,
      }).configJson,
    ).toEqual({});
  });

  it("round-trips registryEntry with empty tags/metadata", () => {
    const full = rowToRegistryEntry(
      registryEntryToRow({
        id: "re1",
        tenantId: "t1",
        organisationId: "o1",
        registryKind: "template",
        entryKey: "entry-1",
        name: "Entry",
        description: "Desc",
        status: "enabled",
        version: "1.0.0",
        tags: ["t1"],
        metadata: { k: "v" },
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(full.tags).toEqual(["t1"]);
    expect(full.metadata).toEqual({ k: "v" });
    expect(full.version).toBe("1.0.0");

    const sparse = rowToRegistryEntry(
      registryEntryToRow({
        id: "re2",
        tenantId: "t1",
        registryKind: "component",
        entryKey: "entry-2",
        name: "Sparse",
        status: "enabled",
        tags: [],
        metadata: {},
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(sparse.description).toBeUndefined();
    expect(sparse.version).toBeUndefined();
    expect(sparse.tags).toEqual([]);
    expect(sparse.metadata).toEqual({});

    expect(
      rowToRegistryEntry({
        ...registryEntryToRow({
          id: "re3",
          tenantId: "t1",
          registryKind: "component",
          entryKey: "entry-3",
          name: "Nulls",
          status: "enabled",
          tags: [],
          metadata: {},
          revision: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
        tags: null,
        metadata: null,
      }).tags,
    ).toEqual([]);
  });
});
