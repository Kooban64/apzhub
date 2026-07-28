import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { FetchFn } from "./internal/n8n-fetch-client";
import {
  N8nRestClient,
  type N8nConnectionTestResult,
  type N8nVersionDetection,
} from "./internal/n8n-rest-client";
import {
  mapN8nWorkflowToCanonical,
  mapN8nTagMetadata,
  mapN8nCredentialMetadata,
  mapN8nExecutionMetadata,
} from "./mappers/workflow-mapper";
import type {
  CanonicalCredentialMetadata,
  CanonicalExecutionMetadata,
  CanonicalTagMetadata,
  CanonicalWorkflowMetadata,
} from "./models/canonical";

export interface N8nClientOptions {
  /** Instance base URL (not /api/v1) for healthz probes. */
  readonly baseUrl?: string;
  readonly fetchFn?: FetchFn;
}

/**
 * Public n8n client facade used by the adapter.
 * Wraps the internal REST client; never exposes secret material or raw vendor DTOs.
 * Canonical outputs align with the Workflow Information Model (provider-neutral metadata).
 */
export class N8nClient {
  constructor(
    private readonly rest: N8nRestClient,
    private readonly options: N8nClientOptions = {},
  ) {}

  getLastLatencyMs(): number | undefined {
    return this.rest.getLastLatencyMs();
  }

  testConnection(context: IntegrationRequestContext): Promise<N8nConnectionTestResult> {
    return this.rest.testConnection(context);
  }

  detectVersion(context: IntegrationRequestContext): Promise<N8nVersionDetection> {
    return this.rest.detectVersion(context, {
      baseUrl: this.options.baseUrl,
      fetchFn: this.options.fetchFn,
    });
  }

  async detectCapabilities(context: IntegrationRequestContext): Promise<{
    readonly publicApiReachable: boolean;
    readonly versionTag?: string;
    readonly versionSource: string;
    readonly workflowsReadable: boolean;
  }> {
    const version = await this.detectVersion(context);
    return {
      publicApiReachable: true,
      versionTag: version.tag,
      versionSource: version.source,
      workflowsReadable: true,
    };
  }

  async listWorkflowsMetadata(
    context: IntegrationRequestContext,
  ): Promise<readonly CanonicalWorkflowMetadata[]> {
    const list = await this.rest.listWorkflows(context, { limit: 50 });
    return list.data.map(mapN8nWorkflowToCanonical);
  }

  async listTagsMetadata(
    context: IntegrationRequestContext,
  ): Promise<readonly CanonicalTagMetadata[]> {
    const list = await this.rest.listTags(context);
    return list.data.map(mapN8nTagMetadata);
  }

  async listCredentialsMetadata(
    context: IntegrationRequestContext,
  ): Promise<readonly CanonicalCredentialMetadata[]> {
    const list = await this.rest.listCredentialsMetadata(context);
    return list.data.map(mapN8nCredentialMetadata);
  }

  async listExecutionsMetadata(
    context: IntegrationRequestContext,
  ): Promise<readonly CanonicalExecutionMetadata[]> {
    const list = await this.rest.listExecutionsMetadata(context, { limit: 20 });
    return list.data.map(mapN8nExecutionMetadata);
  }
}
