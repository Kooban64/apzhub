import { describe, expect, it } from "vitest";

import {
  asWorkflowActionId,
  asWorkflowAuditId,
  asWorkflowCategoryId,
  asWorkflowConditionId,
  asWorkflowConnectionId,
  asWorkflowFolderId,
  asWorkflowId,
  asWorkflowMetadataId,
  asWorkflowParameterId,
  asWorkflowTemplateId,
  asWorkflowTriggerId,
  asWorkflowVariableId,
  asWorkflowVersionId,
  hasWorkflowEnginePermission,
  hasWorkflowPermission,
  hasWorkflowTemplatePermission,
  hasWorkflowValidationPermission,
  isPlatformIdShape,
  isPlatformWorkflowPermission,
  isWorkflowLifecycleState,
  isWorkflowVersionStatus,
  PLATFORM_WORKFLOW_PERMISSIONS,
  PLATFORM_WORKFLOW_PERMISSION_WILDCARD,
  PLATFORM_WORKFLOW_TEMPLATE_PERMISSION_WILDCARD,
  WORKFLOW_CONTRACTS_VERSION,
  type WorkflowPlatformGateway,
  WORKFLOW_LIFECYCLE_STATES,
  WORKFLOW_NODE_KINDS,
  WORKFLOW_VALIDATION_ISSUE_CODES,
  WORKFLOW_VALUE_TYPES,
  WORKFLOW_VERSION_STATUSES,
} from "./index";

describe("workflow-contracts", () => {
  it("exports stable version 0.3.0", () => {
    expect(WORKFLOW_CONTRACTS_VERSION).toBe("0.3.0");
  });

  it("exports required permission catalogue keys", () => {
    expect(PLATFORM_WORKFLOW_PERMISSION_WILDCARD).toBe("workflow.*");
    expect(PLATFORM_WORKFLOW_TEMPLATE_PERMISSION_WILDCARD).toBe(
      "workflow.template.*",
    );
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
    ]) {
      expect(PLATFORM_WORKFLOW_PERMISSIONS).toContain(key);
      expect(isPlatformWorkflowPermission(key)).toBe(true);
    }
    expect(isPlatformWorkflowPermission("workflow.execute")).toBe(false);
  });

  it("evaluates permission helpers with wildcards", () => {
    expect(hasWorkflowPermission(["workflow.*"], "view")).toBe(true);
    expect(hasWorkflowPermission(["workflow.view"], "view")).toBe(true);
    expect(hasWorkflowPermission(["workflow.view"], "delete")).toBe(false);
    expect(hasWorkflowPermission(["workflow.validation"], "validation")).toBe(
      true,
    );
    expect(hasWorkflowValidationPermission(["workflow.*"])).toBe(true);
    expect(hasWorkflowValidationPermission(["workflow.view"])).toBe(false);
    expect(hasWorkflowTemplatePermission(["workflow.*"], "create")).toBe(true);
    expect(
      hasWorkflowTemplatePermission(["workflow.template.*"], "delete"),
    ).toBe(true);
    expect(
      hasWorkflowTemplatePermission(["workflow.template.view"], "view"),
    ).toBe(true);
    expect(
      hasWorkflowTemplatePermission(["workflow.template.view"], "delete"),
    ).toBe(false);
    expect(hasWorkflowEnginePermission(["workflow.engine.*"], "read")).toBe(
      true,
    );
    expect(hasWorkflowEnginePermission(["workflow.*"], "capabilities")).toBe(
      true,
    );
    expect(
      hasWorkflowEnginePermission(["workflow.engine.read"], "diagnostics"),
    ).toBe(false);
  });

  it("exports nested WorkflowPlatformGateway facet keys", () => {
    const facets: (keyof WorkflowPlatformGateway)[] = [
      "workflows",
      "versions",
      "templates",
      "categories",
      "folders",
      "validation",
      "audit",
      "engine",
    ];
    expect(facets).toHaveLength(8);
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
  });
});
