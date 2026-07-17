/**
 * Module-level Platform Workflow client accessor + facades (APZWORKFLOW-003).
 */

import {
  createHttpWorkflowClient,
  type WorkflowClient,
} from "./workflow-client";
import { createMockWorkflowClient } from "./mock-workflow-client";
import type {
  CreateWorkflowCategoryClientInput,
  CreateWorkflowClientInput,
  CreateWorkflowFolderClientInput,
  CreateWorkflowTemplateClientInput,
  CreateWorkflowVersionClientInput,
  ListWorkflowsClientQuery,
  TransitionWorkflowClientInput,
  UpdateWorkflowClientInput,
  UpdateWorkflowTemplateClientInput,
  ValidateWorkflowClientInput,
  WorkflowAuditViewModel,
  WorkflowCategoryViewModel,
  WorkflowClientRequestOptions,
  WorkflowCollectionResult,
  WorkflowFolderViewModel,
  WorkflowManagementPlaneViewModel,
  WorkflowSummaryViewModel,
  WorkflowTemplateViewModel,
  WorkflowValidationViewModel,
  WorkflowVersionViewModel,
  WorkflowViewModel,
} from "./workflow-types";

let workflowClient: WorkflowClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockWorkflowClient()
    : createHttpWorkflowClient();

export function setWorkflowClient(client: WorkflowClient): void {
  workflowClient = client;
}

export function getWorkflowClient(): WorkflowClient {
  return workflowClient;
}

export function resetWorkflowClient(): void {
  workflowClient = createMockWorkflowClient();
}

export function listWorkflows(
  query?: ListWorkflowsClientQuery,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowCollectionResult<WorkflowSummaryViewModel>> {
  return getWorkflowClient().listWorkflows(query, options);
}

export function getWorkflow(
  workflowId: string,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowViewModel> {
  return getWorkflowClient().getWorkflow(workflowId, options);
}

export function createWorkflow(
  input: CreateWorkflowClientInput,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowViewModel> {
  return getWorkflowClient().createWorkflow(input, options);
}

export function updateWorkflow(
  workflowId: string,
  input: UpdateWorkflowClientInput,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowViewModel> {
  return getWorkflowClient().updateWorkflow(workflowId, input, options);
}

export function deleteWorkflow(
  workflowId: string,
  options?: WorkflowClientRequestOptions,
): Promise<{ readonly deleted: boolean; readonly workflowId: string }> {
  return getWorkflowClient().deleteWorkflow(workflowId, options);
}

export function publishWorkflow(
  workflowId: string,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowViewModel> {
  return getWorkflowClient().publishWorkflow(workflowId, options);
}

export function archiveWorkflow(
  workflowId: string,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowViewModel> {
  return getWorkflowClient().archiveWorkflow(workflowId, options);
}

export function restoreWorkflow(
  workflowId: string,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowViewModel> {
  return getWorkflowClient().restoreWorkflow(workflowId, options);
}

export function transitionWorkflow(
  workflowId: string,
  input: TransitionWorkflowClientInput,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowViewModel> {
  return getWorkflowClient().transitionWorkflow(workflowId, input, options);
}

export function listWorkflowVersions(
  workflowId: string,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowCollectionResult<WorkflowVersionViewModel>> {
  return getWorkflowClient().listVersions(workflowId, options);
}

export function createWorkflowVersion(
  workflowId: string,
  input: CreateWorkflowVersionClientInput,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowVersionViewModel> {
  return getWorkflowClient().createVersion(workflowId, input, options);
}

export function getWorkflowVersion(
  workflowId: string,
  versionId: string,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowVersionViewModel> {
  return getWorkflowClient().getVersion(workflowId, versionId, options);
}

export function listWorkflowAudit(
  workflowId: string,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowCollectionResult<WorkflowAuditViewModel>> {
  return getWorkflowClient().listAudit(workflowId, options);
}

export function listWorkflowTemplates(
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowCollectionResult<WorkflowTemplateViewModel>> {
  return getWorkflowClient().listTemplates(options);
}

export function getWorkflowTemplate(
  templateId: string,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowTemplateViewModel> {
  return getWorkflowClient().getTemplate(templateId, options);
}

export function createWorkflowTemplate(
  input: CreateWorkflowTemplateClientInput,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowTemplateViewModel> {
  return getWorkflowClient().createTemplate(input, options);
}

export function updateWorkflowTemplate(
  templateId: string,
  input: UpdateWorkflowTemplateClientInput,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowTemplateViewModel> {
  return getWorkflowClient().updateTemplate(templateId, input, options);
}

export function deleteWorkflowTemplate(
  templateId: string,
  options?: WorkflowClientRequestOptions,
): Promise<{ readonly deleted: boolean; readonly templateId: string }> {
  return getWorkflowClient().deleteTemplate(templateId, options);
}

export function listWorkflowCategories(
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowCollectionResult<WorkflowCategoryViewModel>> {
  return getWorkflowClient().listCategories(options);
}

export function getWorkflowCategory(
  categoryId: string,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowCategoryViewModel> {
  return getWorkflowClient().getCategory(categoryId, options);
}

export function createWorkflowCategory(
  input: CreateWorkflowCategoryClientInput,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowCategoryViewModel> {
  return getWorkflowClient().createCategory(input, options);
}

export function listWorkflowFolders(
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowCollectionResult<WorkflowFolderViewModel>> {
  return getWorkflowClient().listFolders(options);
}

export function getWorkflowFolder(
  folderId: string,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowFolderViewModel> {
  return getWorkflowClient().getFolder(folderId, options);
}

export function createWorkflowFolder(
  input: CreateWorkflowFolderClientInput,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowFolderViewModel> {
  return getWorkflowClient().createFolder(input, options);
}

export function validateWorkflow(
  input: ValidateWorkflowClientInput,
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowValidationViewModel> {
  return getWorkflowClient().validate(input, options);
}

export function getWorkflowCapabilities(
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowManagementPlaneViewModel> {
  return getWorkflowClient().getCapabilities(options);
}

export function getWorkflowHealth(
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowManagementPlaneViewModel> {
  return getWorkflowClient().getHealth(options);
}

export function getWorkflowReadiness(
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowManagementPlaneViewModel> {
  return getWorkflowClient().getReadiness(options);
}

export function getWorkflowDiagnostics(
  options?: WorkflowClientRequestOptions,
): Promise<WorkflowManagementPlaneViewModel> {
  return getWorkflowClient().getDiagnostics(options);
}

export {
  createHttpWorkflowClient,
  createMockWorkflowClient,
  type WorkflowClient,
};
export * from "./workflow-types";
export * from "./workflow-errors";
export * from "./routes";
export * from "./query-keys";
