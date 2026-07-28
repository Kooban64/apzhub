import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { IntegrationClient } from "@apzhub/integration-sdk/client";

import type {
  MetabaseCollectionRecord,
  MetabaseHealthResponse,
  MetabaseSessionProperties,
  MetabaseSessionResponse,
} from "./metabase-api-types";

export type MetabaseRestAuth =
  | { readonly kind: "api_key"; readonly token: string }
  | {
      readonly kind: "session";
      readonly username: string;
      readonly password: string;
    };

export interface MetabaseRestClientOptions {
  readonly client: IntegrationClient;
  readonly getAuth: () => Promise<MetabaseRestAuth>;
}

export interface MetabaseConnectionTestResult {
  readonly ok: boolean;
  readonly latencyMs: number;
  readonly versionHint?: string;
  readonly healthStatus?: string;
}

/**
 * Internal REST client — Metabase `/api` foundation surface.
 * Never export secrets. Prefer exporting {@link MetabaseClient} facade.
 */
export class MetabaseRestClient {
  private readonly client: IntegrationClient;
  private readonly getAuth: () => Promise<MetabaseRestAuth>;
  private lastLatencyMs?: number;
  private cachedSessionId?: string;

  constructor(options: MetabaseRestClientOptions) {
    this.client = options.client;
    this.getAuth = options.getAuth;
  }

  getLastLatencyMs(): number | undefined {
    return this.lastLatencyMs;
  }

  clearSession(): void {
    this.cachedSessionId = undefined;
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<MetabaseConnectionTestResult> {
    const startedAt = Date.now();
    const health = await this.getHealth(context);
    // Authenticated probe — health alone is insufficient for connection verification.
    const props = await this.getSessionProperties(context);
    const latencyMs = Date.now() - startedAt;
    this.lastLatencyMs = latencyMs;
    return {
      ok: true,
      latencyMs,
      versionHint: props.version?.tag,
      healthStatus: health.status ?? "ok",
    };
  }

  async getHealth(context: IntegrationRequestContext): Promise<MetabaseHealthResponse> {
    return this.request(context, "GET", "/health", { skipAuth: true });
  }

  async getSessionProperties(
    context: IntegrationRequestContext,
  ): Promise<MetabaseSessionProperties> {
    return this.request(context, "GET", "/session/properties");
  }

  async listCollections(
    context: IntegrationRequestContext,
  ): Promise<readonly MetabaseCollectionRecord[]> {
    return this.request(context, "GET", "/collection");
  }

  private async resolveAuthHeaders(
    context: IntegrationRequestContext,
  ): Promise<Record<string, string>> {
    const auth = await this.getAuth();
    if (auth.kind === "api_key") {
      return { "X-Api-Key": auth.token };
    }

    if (!this.cachedSessionId) {
      const session = await this.client.request<MetabaseSessionResponse>({
        context,
        method: "POST",
        path: "/session",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Correlation-Id": context.correlationId,
        },
        body: {
          username: auth.username,
          password: auth.password,
        },
      });
      this.cachedSessionId = session.data.id;
    }

    return { "X-Metabase-Session": this.cachedSessionId };
  }

  private async request<T>(
    context: IntegrationRequestContext,
    method: "GET" | "POST",
    path: string,
    options?: { readonly skipAuth?: boolean; readonly body?: unknown },
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Correlation-Id": context.correlationId,
    };

    if (!options?.skipAuth) {
      Object.assign(headers, await this.resolveAuthHeaders(context));
    }

    const startedAt = Date.now();
    try {
      const response = await this.client.request<T>({
        context,
        method,
        path,
        headers,
        body: options?.body,
      });
      this.lastLatencyMs = Date.now() - startedAt;
      return response.data;
    } catch (error) {
      if (
        !options?.skipAuth &&
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        (error as { statusCode?: number }).statusCode === 401
      ) {
        this.cachedSessionId = undefined;
      }
      throw error;
    }
  }
}
