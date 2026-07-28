/**
 * Illustrative contract shapes for documentation / tests.
 * Not runtime fixtures for Platform Services.
 */

import type { WorkflowPlatformServiceContext } from "../services/platform-gateway";
import type {
  WorkflowCapability,
  WorkflowDefinition,
  WorkflowHealth,
  WorkflowProvider,
  WorkflowRun,
  WorkflowSchedule,
  WorkflowSecretReference,
  WorkflowTask,
  WorkflowTriggerBinding,
} from "../domain/runtime";
import type { Workflow, WorkflowTemplate } from "../domain/workflow";
import {
  asWorkflowCapabilityId,
  asWorkflowId,
  asWorkflowProviderId,
  asWorkflowRunId,
  asWorkflowScheduleId,
  asWorkflowSecretReferenceId,
  asWorkflowTaskId,
  asWorkflowTemplateId,
  asWorkflowTriggerId,
  asWorkflowVersionId,
} from "../identifiers";

export const EXAMPLE_WORKFLOW_CONTEXT: WorkflowPlatformServiceContext = {
  tenantId: "tenant_example",
  organisationId: "org_example",
  userId: "user_example",
  correlationId: "corr_workflow_example",
  permissions: ["workflow.view", "workflow.runs.view"],
};

export const EXAMPLE_WORKFLOW: Workflow = {
  id: asWorkflowId("wf_order_fulfil"),
  tenantId: "tenant_example",
  key: "order.fulfillment",
  name: "Order Fulfillment",
  description: "Provider-neutral catalogue workflow",
  lifecycle: "active",
  currentVersionId: asWorkflowVersionId("wfv_order_1"),
  createdAt: "2026-07-01T10:00:00.000Z",
  updatedAt: "2026-07-19T10:00:00.000Z",
  createdBy: "user_example",
  updatedBy: "user_example",
};

export const EXAMPLE_WORKFLOW_TEMPLATE: WorkflowTemplate = {
  id: asWorkflowTemplateId("wft_approval_basic"),
  tenantId: "tenant_example",
  key: "approval.basic",
  name: "Basic Approval",
  lifecycle: "active",
  graph: { nodes: [], connections: [] },
  parameters: [],
  variables: [],
  createdAt: "2026-07-01T10:00:00.000Z",
  updatedAt: "2026-07-19T10:00:00.000Z",
  createdBy: "user_example",
  updatedBy: "user_example",
};

export const EXAMPLE_WORKFLOW_DEFINITION: WorkflowDefinition = {
  versionId: asWorkflowVersionId("wfv_order_1"),
  workflowId: asWorkflowId("wf_order_fulfill"),
  graph: { nodes: [], connections: [] },
  variables: [],
  parameters: [],
  schemaVersion: "1",
};

export const EXAMPLE_WORKFLOW_RUN: WorkflowRun = {
  id: asWorkflowRunId("wfr_run_001"),
  tenantId: "tenant_example",
  workflowId: asWorkflowId("wf_order_fulfill"),
  versionId: asWorkflowVersionId("wfv_order_1"),
  status: "succeeded",
  provider: { providerId: "workflow-provider", providerRef: "prov_run_001" },
  createdAt: "2026-07-19T10:00:00.000Z",
  updatedAt: "2026-07-19T10:05:00.000Z",
  startedAt: "2026-07-19T10:00:01.000Z",
  finishedAt: "2026-07-19T10:05:00.000Z",
};

export const EXAMPLE_WORKFLOW_SCHEDULE: WorkflowSchedule = {
  id: asWorkflowScheduleId("wsch_nightly"),
  tenantId: "tenant_example",
  workflowId: asWorkflowId("wf_order_fulfill"),
  triggerId: asWorkflowTriggerId("wtrg_nightly"),
  cron: "0 2 * * *",
  timezone: "UTC",
  status: "armed",
  createdAt: "2026-07-10T10:00:00.000Z",
  updatedAt: "2026-07-19T10:00:00.000Z",
};

export const EXAMPLE_TRIGGER_BINDING: WorkflowTriggerBinding = {
  id: asWorkflowTriggerId("wtrg_nightly"),
  tenantId: "tenant_example",
  workflowId: asWorkflowId("wf_order_fulfill"),
  kind: "schedule",
  enabled: true,
  scheduleId: asWorkflowScheduleId("wsch_nightly"),
  createdAt: "2026-07-10T10:00:00.000Z",
  updatedAt: "2026-07-19T10:00:00.000Z",
};

export const EXAMPLE_APPROVAL_TASK: WorkflowTask = {
  id: asWorkflowTaskId("wtk_approval_001"),
  tenantId: "tenant_example",
  runId: asWorkflowRunId("wfr_run_001"),
  kind: "approval",
  status: "open",
  title: "Approve fulfillment",
  createdAt: "2026-07-19T10:01:00.000Z",
  updatedAt: "2026-07-19T10:01:00.000Z",
};

export const EXAMPLE_SECRET_REFERENCE: WorkflowSecretReference = {
  id: asWorkflowSecretReferenceId("wsec_ref_001"),
  tenantId: "tenant_example",
  storeUri: "secret://platform/workflow/example",
  label: "example-credential",
};

export const EXAMPLE_WORKFLOW_HEALTH: WorkflowHealth = {
  componentKey: "workflow.platform",
  status: "healthy",
  reasons: [],
  checkedAt: "2026-07-19T12:00:00.000Z",
  providerId: "workflow-provider",
};

export const EXAMPLE_WORKFLOW_CAPABILITY: WorkflowCapability = {
  id: asWorkflowCapabilityId("wcap_definition_sync"),
  key: "workflow.definition.sync",
  support: "supported",
  description: "Sync catalogue metadata from provider",
  providerId: "workflow-provider",
};

export const EXAMPLE_WORKFLOW_PROVIDER: WorkflowProvider = {
  id: asWorkflowProviderId("wprov_primary"),
  key: "workflow-provider",
  displayName: "Primary Workflow Provider",
  integrationId: "integration.workflow.primary",
  capabilities: [asWorkflowCapabilityId("wcap_definition_sync")],
  status: "registered",
};
