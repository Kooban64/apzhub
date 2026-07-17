import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { N8nRestClient } from "../internal/n8n-rest-client";
import {
  mapN8nCredentialMetadata,
  mapN8nExecutionMetadata,
  mapN8nProjectMetadata,
  mapN8nTagMetadata,
  mapN8nUserMetadata,
  mapN8nVariableMetadata,
  mapN8nWorkflowAsTemplateMetadata,
  mapN8nWorkflowToCanonical,
} from "../mappers/workflow-mapper";
import type {
  CanonicalCredentialMetadata,
  CanonicalExecutionMetadata,
  CanonicalProjectMetadata,
  CanonicalTagMetadata,
  CanonicalUserMetadata,
  CanonicalVariableMetadata,
  CanonicalWorkflowMetadata,
  CanonicalWorkflowTemplateMetadata,
} from "../models/canonical";
import {
  N8N_CORE_SERVICE_CAPABILITIES,
  N8N_UNSUPPORTED_OPERATIONS,
} from "../capabilities/service-capabilities";
import { buildN8nCompatibilityMatrix } from "../operations";

export class N8nNotSupportedError extends Error {
  readonly code = "NOT_SUPPORTED";
  constructor(operation: string) {
    super(`n8n adapter does not support operation: ${operation}`);
    this.name = "N8nNotSupportedError";
  }
}

export interface N8nCoreServices {
  listWorkflows(
    context: IntegrationRequestContext,
    query?: { readonly limit?: number; readonly cursor?: string },
  ): Promise<readonly CanonicalWorkflowMetadata[]>;
  getWorkflow(
    context: IntegrationRequestContext,
    workflowId: string,
  ): Promise<CanonicalWorkflowMetadata>;
  validateWorkflowMetadata(
    context: IntegrationRequestContext,
    workflowId: string,
  ): Promise<{ readonly valid: boolean; readonly issues: readonly string[] }>;
  listWorkflowTemplates(
    context: IntegrationRequestContext,
  ): Promise<readonly CanonicalWorkflowTemplateMetadata[]>;
  getWorkflowTemplate(
    context: IntegrationRequestContext,
    templateId: string,
  ): Promise<CanonicalWorkflowTemplateMetadata>;
  listCredentialsMetadata(
    context: IntegrationRequestContext,
  ): Promise<readonly CanonicalCredentialMetadata[]>;
  getCredentialMetadata(
    context: IntegrationRequestContext,
    credentialId: string,
  ): Promise<CanonicalCredentialMetadata>;
  listVariablesMetadata(
    context: IntegrationRequestContext,
  ): Promise<readonly CanonicalVariableMetadata[]>;
  getVariableMetadata(
    context: IntegrationRequestContext,
    variableId: string,
  ): Promise<CanonicalVariableMetadata>;
  listExecutionsMetadata(
    context: IntegrationRequestContext,
    query?: { readonly limit?: number; readonly cursor?: string },
  ): Promise<readonly CanonicalExecutionMetadata[]>;
  getExecutionMetadata(
    context: IntegrationRequestContext,
    executionId: string,
  ): Promise<CanonicalExecutionMetadata>;
  listTags(
    context: IntegrationRequestContext,
  ): Promise<readonly CanonicalTagMetadata[]>;
  getTag(
    context: IntegrationRequestContext,
    tagId: string,
  ): Promise<CanonicalTagMetadata>;
  listUsers(
    context: IntegrationRequestContext,
  ): Promise<readonly CanonicalUserMetadata[]>;
  getUser(
    context: IntegrationRequestContext,
    userId: string,
  ): Promise<CanonicalUserMetadata>;
  listProjects(
    context: IntegrationRequestContext,
  ): Promise<readonly CanonicalProjectMetadata[]>;
  getProject(
    context: IntegrationRequestContext,
    projectId: string,
  ): Promise<CanonicalProjectMetadata>;
  getCapabilities(): {
    readonly services: typeof N8N_CORE_SERVICE_CAPABILITIES;
    readonly unsupportedOperations: typeof N8N_UNSUPPORTED_OPERATIONS;
  };
  getCompatibility(): ReturnType<typeof buildN8nCompatibilityMatrix>;
  /** Explicitly reject mutation/execution. */
  rejectUnsupported(operation: string): never;
}

async function withNotFoundAsUnsupported<T>(
  operation: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      Number((error as { statusCode?: number }).statusCode) === 404
    ) {
      throw new N8nNotSupportedError(operation);
    }
    throw error;
  }
}

export function createN8nCoreServices(deps: {
  readonly client: N8nRestClient;
}): N8nCoreServices {
  return {
    async listWorkflows(context, query) {
      const response = await deps.client.listWorkflows(context, query);
      return response.data.map(mapN8nWorkflowToCanonical);
    },
    async getWorkflow(context, workflowId) {
      const record = await deps.client.getWorkflow(context, workflowId);
      return mapN8nWorkflowToCanonical(record);
    },
    async validateWorkflowMetadata(context, workflowId) {
      const workflow = await this.getWorkflow(context, workflowId);
      const issues: string[] = [];
      if (!workflow.name.trim()) issues.push("name is required");
      if (workflow.nodeCount < 1) issues.push("workflow has no nodes");
      return { valid: issues.length === 0, issues };
    },
    async listWorkflowTemplates(context) {
      const workflows = await this.listWorkflows(context, { limit: 50 });
      return workflows.map((w) =>
        mapN8nWorkflowAsTemplateMetadata({
          id: w.id,
          name: w.name,
          tags: w.tagNames.map((name) => ({ name })),
        }),
      );
    },
    async getWorkflowTemplate(context, templateId) {
      const workflow = await this.getWorkflow(context, templateId);
      return mapN8nWorkflowAsTemplateMetadata({
        id: workflow.id,
        name: workflow.name,
        tags: workflow.tagNames.map((name) => ({ name })),
      });
    },
    async listCredentialsMetadata(context) {
      const response = await deps.client.listCredentialsMetadata(context);
      return response.data.map(mapN8nCredentialMetadata);
    },
    async getCredentialMetadata(context, credentialId) {
      const record = await deps.client.getCredentialMetadata(context, credentialId);
      return mapN8nCredentialMetadata(record);
    },
    async listVariablesMetadata(context) {
      return withNotFoundAsUnsupported("variables.list", async () => {
        const response = await deps.client.listVariablesMetadata(context);
        return response.data.map(mapN8nVariableMetadata);
      });
    },
    async getVariableMetadata(context, variableId) {
      return withNotFoundAsUnsupported("variables.get", async () => {
        const record = await deps.client.getVariableMetadata(context, variableId);
        return mapN8nVariableMetadata(record);
      });
    },
    async listExecutionsMetadata(context, query) {
      const response = await deps.client.listExecutionsMetadata(context, query);
      return response.data.map(mapN8nExecutionMetadata);
    },
    async getExecutionMetadata(context, executionId) {
      const record = await deps.client.getExecutionMetadata(context, executionId);
      return mapN8nExecutionMetadata(record);
    },
    async listTags(context) {
      const response = await deps.client.listTags(context);
      return response.data.map(mapN8nTagMetadata);
    },
    async getTag(context, tagId) {
      const record = await deps.client.getTag(context, tagId);
      return mapN8nTagMetadata(record);
    },
    async listUsers(context) {
      return withNotFoundAsUnsupported("users.list", async () => {
        const response = await deps.client.listUsers(context);
        return response.data.map(mapN8nUserMetadata);
      });
    },
    async getUser(context, userId) {
      return withNotFoundAsUnsupported("users.get", async () => {
        const record = await deps.client.getUser(context, userId);
        return mapN8nUserMetadata(record);
      });
    },
    async listProjects(context) {
      return withNotFoundAsUnsupported("projects.list", async () => {
        const response = await deps.client.listProjects(context);
        return response.data.map(mapN8nProjectMetadata);
      });
    },
    async getProject(context, projectId) {
      return withNotFoundAsUnsupported("projects.get", async () => {
        const record = await deps.client.getProject(context, projectId);
        return mapN8nProjectMetadata(record);
      });
    },
    getCapabilities() {
      return {
        services: N8N_CORE_SERVICE_CAPABILITIES,
        unsupportedOperations: N8N_UNSUPPORTED_OPERATIONS,
      };
    },
    getCompatibility() {
      return buildN8nCompatibilityMatrix();
    },
    rejectUnsupported(operation: string): never {
      throw new N8nNotSupportedError(operation);
    },
  };
}
