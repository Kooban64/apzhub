import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { IntegrationClient } from "@apzhub/integration-sdk/client";
import type {
  PlaneConnectionTestResult,
  PlaneInstanceResponse,
  PlaneWorkspaceResponse,
} from "./plane-api-types";

export interface PlaneClientAuth {
  readonly apiKey: string;
}

export interface PlaneClientOptions {
  readonly client: IntegrationClient;
  readonly workspaceSlug: string;
  readonly getAuth: () => Promise<PlaneClientAuth>;
}

/** Internal REST client — import only from plane-adapter and tests. */
export class PlaneClient {
  private readonly client: IntegrationClient;
  private readonly workspaceSlug: string;
  private readonly getAuth: () => Promise<PlaneClientAuth>;

  constructor(options: PlaneClientOptions) {
    this.client = options.client;
    this.workspaceSlug = options.workspaceSlug;
    this.getAuth = options.getAuth;
  }

  async getInstance(
    context: IntegrationRequestContext,
  ): Promise<PlaneInstanceResponse> {
    const auth = await this.getAuth();
    const response = await this.client.request<PlaneInstanceResponse>({
      context,
      method: "GET",
      path: "/api/instances/",
      headers: this.buildAuthHeaders(auth),
    });
    return response.data;
  }

  async getWorkspace(
    context: IntegrationRequestContext,
  ): Promise<PlaneWorkspaceResponse> {
    const auth = await this.getAuth();
    const response = await this.client.request<PlaneWorkspaceResponse>({
      context,
      method: "GET",
      path: `/api/v1/workspaces/${this.workspaceSlug}/`,
      headers: this.buildAuthHeaders(auth),
    });
    return response.data;
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<PlaneConnectionTestResult> {
    const startedAt = Date.now();
    const instance = await this.getInstance(context);
    const workspace = await this.getWorkspace(context);

    return {
      ok: true,
      engineVersion: instance.instance.version,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      latencyMs: Date.now() - startedAt,
    };
  }

  private buildAuthHeaders(auth: PlaneClientAuth): Readonly<Record<string, string>> {
    return {
      "X-Api-Key": auth.apiKey,
    };
  }
}
