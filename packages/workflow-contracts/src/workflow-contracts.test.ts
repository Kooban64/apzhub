import { describe, expect, it, expectTypeOf } from "vitest";

import type {
  ApprovalService,
  CapabilityService,
  HealthService,
  NotificationService,
  WorkflowCanonicalGateway,
  WorkflowPlatformGateway,
  WorkflowRunService,
  WorkflowScheduleService,
  WorkflowService,
  WorkflowTaskService,
  WorkflowTemplateService,
} from "./index";
import {
  EXAMPLE_APPROVAL_TASK,
  EXAMPLE_SECRET_REFERENCE,
  EXAMPLE_TRIGGER_BINDING,
  EXAMPLE_WORKFLOW,
  EXAMPLE_WORKFLOW_CAPABILITY,
  EXAMPLE_WORKFLOW_CONTEXT,
  EXAMPLE_WORKFLOW_DEFINITION,
  EXAMPLE_WORKFLOW_HEALTH,
  EXAMPLE_WORKFLOW_PROVIDER,
  EXAMPLE_WORKFLOW_RUN,
  EXAMPLE_WORKFLOW_SCHEDULE,
  EXAMPLE_WORKFLOW_TEMPLATE,
  PLATFORM_WORKFLOW_PERMISSIONS,
  PLATFORM_WORKFLOW_PERMISSION_WILDCARD,
  PLATFORM_WORKFLOW_TEMPLATE_PERMISSION_WILDCARD,
  WORKFLOW_CONTRACTS_VERSION,
  WORKFLOW_LIFECYCLE_STATES,
  WORKFLOW_NODE_KINDS,
  WORKFLOW_PERMISSION_OPERATIONS,
  WORKFLOW_RUN_STATUSES,
  WORKFLOW_TASK_KINDS,
  WORKFLOW_VALIDATION_ISSUE_CODES,
  WORKFLOW_VALUE_TYPES,
  WORKFLOW_VERSION_STATUSES,
  asWorkflowActionId,
  asWorkflowAuditId,
  asWorkflowCategoryId,
  asWorkflowConditionId,
  asWorkflowConnectionId,
  asWorkflowFolderId,
  asWorkflowId,
  asWorkflowMetadataId,
  asWorkflowParameterId,
  asWorkflowRunId,
  asWorkflowScheduleId,
  asWorkflowSecretReferenceId,
  asWorkflowTaskId,
  asWorkflowTemplateId,
  asWorkflowTriggerId,
  asWorkflowVariableId,
  asWorkflowVersionId,
  hasWorkflowCredentialsPermission,
  hasWorkflowEnginePermission,
  hasWorkflowNamedOperation,
  hasWorkflowPermission,
  hasWorkflowRunsPermission,
  hasWorkflowSchedulesPermission,
  hasWorkflowTasksPermission,
  hasWorkflowTemplatePermission,
  hasWorkflowValidationPermission,
  isPlatformIdShape,
  isPlatformWorkflowPermission,
  isWorkflowLifecycleState,
  isWorkflowRunStatus,
  isWorkflowTaskKind,
  isWorkflowVersionStatus,
} from "./index";

describe("@apzhub/workflow-contracts", () => {
  it("exports package version 0.4.2", () => {
    expect(WORKFLOW_CONTRACTS_VERSION).toBe("0.4.2");
  });

  it("exports required permission catalogue keys including runtime plane", () => {
    expect(PLATFORM_WORKFLOW_PERMISSION_WILDCARD).toBe("workflow.*");
    expect(PLATFORM_WORKFLOW_TEMPLATE_PERMISSION_WILDCARD).toBe("workflow.template.*");
    for (const key of [
      "workflow.*",
      "workflow.view",
      "workflow.create",
      "workflow.update",
      "workflow.delete",
      "workflow.publish",
      "workflow.archive",
      "workflow.restore",
      "workflow.audit",
      "workflow.validation",
      "workflow.admin",
      "workflow.template.*",
      "workflow.template.view",
      "workflow.template.create",
      "workflow.template.update",
      "workflow.template.delete",
      "workflow.engine.*",
      "workflow.engine.read",
      "workflow.engine.health",
      "workflow.engine.diagnostics",
      "workflow.engine.capabilities",
      "workflow.runs.*",
      "workflow.runs.view",
      "workflow.runs.start",
      "workflow.runs.cancel",
      "workflow.schedules.*",
      "workflow.schedules.view",
      "workflow.schedules.manage",
      "workflow.tasks.*",
      "workflow.tasks.view",
      "workflow.tasks.claim",
      "workflow.tasks.complete",
      "workflow.tasks.approve",
      "workflow.credentials.*",
      "workflow.credentials.view",
      "workflow.credentials.manage",
    ]) {
      expect(PLATFORM_WORKFLOW_PERMISSIONS).toContain(key);
      expect(isPlatformWorkflowPermission(key)).toBe(true);
    }
    expect(isPlatformWorkflowPermission("workflow.execute")).toBe(false);
    expect(WORKFLOW_PERMISSION_OPERATIONS.startRun).toBe("workflow.runs.start");
    expect(WORKFLOW_PERMISSION_OPERATIONS.approveTask).toBe("workflow.tasks.approve");
    expect(WORKFLOW_PERMISSION_OPERATIONS.administerWorkflow).toBe("workflow.admin");
  });

  it("evaluates permission helpers with wildcards and named operations", () => {
    expect(hasWorkflowPermission(["workflow.*"], "view")).toBe(true);
    expect(hasWorkflowPermission(["workflow.view"], "view")).toBe(true);
    expect(hasWorkflowPermission(["workflow.view"], "delete")).toBe(false);
    expect(hasWorkflowPermission(["workflow.admin"], "admin")).toBe(true);
    expect(hasWorkflowValidationPermission(["workflow.*"])).toBe(true);
    expect(hasWorkflowValidationPermission(["workflow.view"])).toBe(false);
    expect(hasWorkflowTemplatePermission(["workflow.*"], "create")).toBe(true);
    expect(hasWorkflowTemplatePermission(["workflow.template.*"], "delete")).toBe(true);
    expect(hasWorkflowTemplatePermission(["workflow.template.view"], "view")).toBe(
      true,
    );
    expect(hasWorkflowTemplatePermission(["workflow.template.view"], "delete")).toBe(
      false,
    );
    expect(hasWorkflowEnginePermission(["workflow.engine.*"], "read")).toBe(true);
    expect(hasWorkflowEnginePermission(["workflow.*"], "capabilities")).toBe(true);
    expect(hasWorkflowEnginePermission(["workflow.engine.read"], "diagnostics")).toBe(
      false,
    );
    expect(hasWorkflowRunsPermission(["workflow.runs.*"], "start")).toBe(true);
    expect(hasWorkflowRunsPermission(["workflow.runs.view"], "cancel")).toBe(false);
    expect(
      hasWorkflowSchedulesPermission(["workflow.schedules.manage"], "manage"),
    ).toBe(true);
    expect(hasWorkflowTasksPermission(["workflow.tasks.approve"], "approve")).toBe(
      true,
    );
    expect(
      hasWorkflowCredentialsPermission(["workflow.credentials.view"], "manage"),
    ).toBe(false);
    expect(hasWorkflowNamedOperation(["workflow.*"], "startRun")).toBe(true);
    expect(hasWorkflowNamedOperation(["workflow.runs.start"], "startRun")).toBe(true);
    expect(hasWorkflowNamedOperation(["workflow.view"], "startRun")).toBe(false);
  });

  it("exports nested WorkflowPlatformGateway facet keys (SoR + runtime)", () => {
    const facets: (keyof WorkflowPlatformGateway)[] = [
      "workflows",
      "versions",
      "templates",
      "categories",
      "folders",
      "validation",
      "audit",
      "engine",
      "runs",
      "schedules",
      "tasks",
      "approvals",
      "notifications",
      "capabilities",
      "health",
    ];
    expect(facets).toHaveLength(15);
  });

  it("exposes canonical gateway and Owner service interface types", () => {
    expectTypeOf<WorkflowService>().toHaveProperty("create");
    expectTypeOf<WorkflowTemplateService>().toHaveProperty("list");
    expectTypeOf<WorkflowRunService>().toHaveProperty("start");
    expectTypeOf<WorkflowRunService>().toHaveProperty("listSteps");
    expectTypeOf<WorkflowScheduleService>().toHaveProperty("arm");
    expectTypeOf<WorkflowTaskService>().toHaveProperty("listInbox");
    expectTypeOf<ApprovalService>().toHaveProperty("approve");
    expectTypeOf<NotificationService>().toHaveProperty("publishIntent");
    expectTypeOf<NotificationService>().toHaveProperty("listIntents");
    expectTypeOf<CapabilityService>().toHaveProperty("listCapabilities");
    expectTypeOf<HealthService>().toHaveProperty("getHealth");
    expectTypeOf<WorkflowCanonicalGateway>().toHaveProperty("runs");
    expectTypeOf<WorkflowCanonicalGateway>().toHaveProperty("platform");
  });

  it("validates branded identifiers and catalogues", () => {
    expect(isPlatformIdShape("wf_1")).toBe(true);
    expect(isPlatformIdShape("")).toBe(false);
    expect(asWorkflowId("wf_abc")).toBe("wf_abc");
    expect(asWorkflowVersionId("ver_1")).toBe("ver_1");
    expect(asWorkflowTemplateId("tpl_1")).toBe("tpl_1");
    expect(asWorkflowCategoryId("cat_1")).toBe("cat_1");
    expect(asWorkflowFolderId("fold_1")).toBe("fold_1");
    expect(asWorkflowVariableId("var_1")).toBe("var_1");
    expect(asWorkflowParameterId("par_1")).toBe("par_1");
    expect(asWorkflowTriggerId("trg_1")).toBe("trg_1");
    expect(asWorkflowActionId("act_1")).toBe("act_1");
    expect(asWorkflowConditionId("cond_1")).toBe("cond_1");
    expect(asWorkflowConnectionId("conn_1")).toBe("conn_1");
    expect(asWorkflowAuditId("aud_1")).toBe("aud_1");
    expect(asWorkflowMetadataId("meta_1")).toBe("meta_1");
    expect(asWorkflowRunId("wfr_1")).toBe("wfr_1");
    expect(asWorkflowScheduleId("wsch_1")).toBe("wsch_1");
    expect(asWorkflowTaskId("wtk_1")).toBe("wtk_1");
    expect(asWorkflowSecretReferenceId("wsec_1")).toBe("wsec_1");
    expect(() => asWorkflowId("")).toThrow(/Invalid platform identifier/);
    expect(WORKFLOW_LIFECYCLE_STATES).toEqual([
      "draft",
      "active",
      "inactive",
      "archived",
      "deprecated",
      "restored",
    ]);
    expect(isWorkflowLifecycleState("draft")).toBe(true);
    expect(isWorkflowLifecycleState("running")).toBe(false);
    expect(WORKFLOW_VERSION_STATUSES).toContain("published");
    expect(isWorkflowVersionStatus("draft")).toBe(true);
    expect(isWorkflowVersionStatus("executing")).toBe(false);
    expect(WORKFLOW_NODE_KINDS).toEqual(["trigger", "action", "condition"]);
    expect(WORKFLOW_VALUE_TYPES).toContain("string");
    expect(WORKFLOW_VALIDATION_ISSUE_CODES).toContain("structural");
    expect(WORKFLOW_RUN_STATUSES).toContain("succeeded");
    expect(isWorkflowRunStatus("queued")).toBe(true);
    expect(isWorkflowRunStatus("n8n-waiting")).toBe(false);
    expect(WORKFLOW_TASK_KINDS).toEqual(["manual", "approval", "human"]);
    expect(isWorkflowTaskKind("approval")).toBe(true);
  });

  it("example shapes are provider-agnostic (no n8n leakage)", () => {
    const blob = JSON.stringify({
      EXAMPLE_WORKFLOW_CONTEXT,
      EXAMPLE_WORKFLOW,
      EXAMPLE_WORKFLOW_TEMPLATE,
      EXAMPLE_WORKFLOW_DEFINITION,
      EXAMPLE_WORKFLOW_RUN,
      EXAMPLE_WORKFLOW_SCHEDULE,
      EXAMPLE_TRIGGER_BINDING,
      EXAMPLE_APPROVAL_TASK,
      EXAMPLE_SECRET_REFERENCE,
      EXAMPLE_WORKFLOW_HEALTH,
      EXAMPLE_WORKFLOW_CAPABILITY,
      EXAMPLE_WORKFLOW_PROVIDER,
    });
    expect(blob.toLowerCase()).not.toMatch(
      /\bn8n\b|x-n8n-api-key|\/rest\/workflows|webhookId/i,
    );
    expect(EXAMPLE_WORKFLOW_RUN.provider?.providerId).toBe("workflow-provider");
    expect(EXAMPLE_SECRET_REFERENCE.storeUri).toMatch(/^secret:\/\//);
    expect(EXAMPLE_WORKFLOW_DEFINITION.graph.nodes).toEqual([]);
  });

  it("maps Owner model names onto exported contract types", () => {
    // Structural presence checks — types compile via imports above.
    expect(EXAMPLE_WORKFLOW.id).toMatch(/^wf_/);
    expect(EXAMPLE_WORKFLOW_TEMPLATE.id).toMatch(/^wft_/);
    expect(EXAMPLE_WORKFLOW_DEFINITION.versionId).toMatch(/^wfv_/);
    expect(EXAMPLE_WORKFLOW_RUN.status).toBe("succeeded");
    expect(EXAMPLE_WORKFLOW_SCHEDULE.status).toBe("armed");
    expect(EXAMPLE_TRIGGER_BINDING.kind).toBe("schedule");
    expect(EXAMPLE_APPROVAL_TASK.kind).toBe("approval");
    expect(EXAMPLE_SECRET_REFERENCE.id).toBeTruthy();
    expect(EXAMPLE_WORKFLOW_HEALTH.status).toBe("healthy");
    expect(EXAMPLE_WORKFLOW_CAPABILITY.support).toBe("supported");
    expect(EXAMPLE_WORKFLOW_PROVIDER.integrationId).toMatch(/^integration\./);
  });
});
