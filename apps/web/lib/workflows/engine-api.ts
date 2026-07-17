/**
 * Module-level Workflow Engine client accessor (APZWORKFLOW-008).
 * Runtime selects production HTTP client outside tests.
 */

import {
  createHttpWorkflowEngineClient,
  type WorkflowEngineClient,
} from "./engine-client";
import { createMockWorkflowEngineClient } from "./mock-engine-client";
import type {
  WorkflowEngineCapabilitiesViewModel,
  WorkflowEngineClientRequestOptions,
  WorkflowEngineCollectionResult,
  WorkflowEngineCompatibilityViewModel,
  WorkflowEngineConnectionValidationViewModel,
  WorkflowEngineDiagnosticsViewModel,
  WorkflowEngineHealthViewModel,
  WorkflowEngineListQuery,
  WorkflowEngineProjectViewModel,
  WorkflowEngineTagViewModel,
  WorkflowEngineTemplateViewModel,
  WorkflowEngineUserViewModel,
  WorkflowEngineWorkflowViewModel,
} from "./engine-types";

export { workflowEngineQueryKeys } from "./engine-query-keys";

let workflowEngineClient: WorkflowEngineClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockWorkflowEngineClient()
    : createHttpWorkflowEngineClient();

export function setWorkflowEngineClient(client: WorkflowEngineClient): void {
  workflowEngineClient = client;
}

export function getWorkflowEngineClient(): WorkflowEngineClient {
  return workflowEngineClient;
}

export function resetWorkflowEngineClient(): void {
  workflowEngineClient = createMockWorkflowEngineClient();
}

export function listEngineWorkflows(
  query?: WorkflowEngineListQuery,
  options?: WorkflowEngineClientRequestOptions,
): Promise<WorkflowEngineCollectionResult<WorkflowEngineWorkflowViewModel>> {
  return getWorkflowEngineClient().listWorkflows(query, options);
}

export function getEngineWorkflow(
  workflowId: string,
  options?: WorkflowEngineClientRequestOptions,
): Promise<WorkflowEngineWorkflowViewModel> {
  return getWorkflowEngineClient().getWorkflow(workflowId, options);
}

export function listEngineTemplates(
  options?: WorkflowEngineClientRequestOptions,
): Promise<WorkflowEngineCollectionResult<WorkflowEngineTemplateViewModel>> {
  return getWorkflowEngineClient().listTemplates(options);
}

export function getEngineTemplate(
  templateId: string,
  options?: WorkflowEngineClientRequestOptions,
): Promise<WorkflowEngineTemplateViewModel> {
  return getWorkflowEngineClient().getTemplate(templateId, options);
}

export function listEngineTags(
  options?: WorkflowEngineClientRequestOptions,
): Promise<WorkflowEngineCollectionResult<WorkflowEngineTagViewModel>> {
  return getWorkflowEngineClient().listTags(options);
}

export function listEngineUsers(
  options?: WorkflowEngineClientRequestOptions,
): Promise<WorkflowEngineCollectionResult<WorkflowEngineUserViewModel>> {
  return getWorkflowEngineClient().listUsers(options);
}

export function listEngineProjects(
  options?: WorkflowEngineClientRequestOptions,
): Promise<WorkflowEngineCollectionResult<WorkflowEngineProjectViewModel>> {
  return getWorkflowEngineClient().listProjects(options);
}

export function getEngineCapabilities(
  options?: WorkflowEngineClientRequestOptions,
): Promise<WorkflowEngineCapabilitiesViewModel> {
  return getWorkflowEngineClient().capabilities(options);
}

export function getEngineHealth(
  options?: WorkflowEngineClientRequestOptions,
): Promise<WorkflowEngineHealthViewModel> {
  return getWorkflowEngineClient().health(options);
}

export function getEngineDiagnostics(
  options?: WorkflowEngineClientRequestOptions,
): Promise<WorkflowEngineDiagnosticsViewModel> {
  return getWorkflowEngineClient().diagnostics(options);
}

export function getEngineCompatibility(
  options?: WorkflowEngineClientRequestOptions,
): Promise<WorkflowEngineCompatibilityViewModel> {
  return getWorkflowEngineClient().compatibility(options);
}

export function validateEngineConnection(
  options?: WorkflowEngineClientRequestOptions,
): Promise<WorkflowEngineConnectionValidationViewModel> {
  return getWorkflowEngineClient().validate(options);
}
