import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type {
  IntegrationClient,
  IntegrationHttpMethod,
} from "@apzhub/integration-sdk/client";

import type {
  KimaiActivityRecord,
  KimaiActivityWriteBody,
  KimaiCustomerRecord,
  KimaiCustomerWriteBody,
  KimaiListQuery,
  KimaiProjectRecord,
  KimaiProjectWriteBody,
  KimaiTagRecord,
  KimaiTagWriteBody,
  KimaiTimesheetRecord,
  KimaiTimesheetWriteBody,
  KimaiVersionResponse,
} from "./kimai-api-types";

export type KimaiRestAuth =
  | { readonly kind: "bearer"; readonly token: string }
  | {
      readonly kind: "legacy_headers";
      readonly username: string;
      readonly apiPassword: string;
    };

export interface KimaiRestClientOptions {
  readonly client: IntegrationClient;
  readonly getAuth: () => Promise<KimaiRestAuth>;
}

export interface KimaiConnectionTestResult {
  readonly ok: boolean;
  readonly latencyMs: number;
  readonly engineVersion?: string;
  readonly kimaiLabel?: string;
}

function toQuery(
  query?: KimaiListQuery,
): Record<string, string | number | boolean> | undefined {
  if (!query) return undefined;
  const result: Record<string, string | number | boolean> = {};
  if (query.page !== undefined) result.page = query.page;
  if (query.size !== undefined) result.size = query.size;
  if (query.term) result.term = query.term;
  if (query.visible !== undefined) result.visible = query.visible;
  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Internal REST client — Kimai CE foundation + domain endpoints.
 * Never exported from the public package index.
 */
export class KimaiRestClient {
  private readonly client: IntegrationClient;
  private readonly getAuth: () => Promise<KimaiRestAuth>;
  private lastLatencyMs?: number;
  private lastDetectedVersion?: string;

  constructor(options: KimaiRestClientOptions) {
    this.client = options.client;
    this.getAuth = options.getAuth;
  }

  getLastLatencyMs(): number | undefined {
    return this.lastLatencyMs;
  }

  getLastDetectedVersion(): string | undefined {
    return this.lastDetectedVersion;
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<KimaiConnectionTestResult> {
    const startedAt = Date.now();
    await this.ping(context);
    const version = await this.getVersion(context);
    const latencyMs = Date.now() - startedAt;
    this.lastLatencyMs = latencyMs;
    const engineVersion = version.version?.trim() || undefined;
    this.lastDetectedVersion = engineVersion;
    return {
      ok: true,
      latencyMs,
      engineVersion,
      kimaiLabel: version.kimai ?? version.name,
    };
  }

  async ping(context: IntegrationRequestContext): Promise<void> {
    await this.request(context, "GET", "/ping");
  }

  async getVersion(context: IntegrationRequestContext): Promise<KimaiVersionResponse> {
    return this.request<KimaiVersionResponse>(context, "GET", "/version");
  }

  // --- Timesheets ---

  async listTimesheets(
    context: IntegrationRequestContext,
    query?: KimaiListQuery,
  ): Promise<readonly KimaiTimesheetRecord[]> {
    return this.request<readonly KimaiTimesheetRecord[]>(
      context,
      "GET",
      "/timesheets",
      { query: toQuery(query) },
    );
  }

  async getTimesheet(
    context: IntegrationRequestContext,
    id: number,
  ): Promise<KimaiTimesheetRecord> {
    return this.request<KimaiTimesheetRecord>(context, "GET", `/timesheets/${id}`);
  }

  async createTimesheet(
    context: IntegrationRequestContext,
    body: KimaiTimesheetWriteBody,
  ): Promise<KimaiTimesheetRecord> {
    return this.request<KimaiTimesheetRecord>(context, "POST", "/timesheets", {
      body,
    });
  }

  async updateTimesheet(
    context: IntegrationRequestContext,
    id: number,
    body: KimaiTimesheetWriteBody,
  ): Promise<KimaiTimesheetRecord> {
    return this.request<KimaiTimesheetRecord>(context, "PATCH", `/timesheets/${id}`, {
      body,
    });
  }

  async stopTimesheet(
    context: IntegrationRequestContext,
    id: number,
  ): Promise<KimaiTimesheetRecord> {
    return this.request<KimaiTimesheetRecord>(
      context,
      "PATCH",
      `/timesheets/${id}/stop`,
    );
  }

  async deleteTimesheet(context: IntegrationRequestContext, id: number): Promise<void> {
    await this.request(context, "DELETE", `/timesheets/${id}`);
  }

  // --- Activities ---

  async listActivities(
    context: IntegrationRequestContext,
    query?: KimaiListQuery,
  ): Promise<readonly KimaiActivityRecord[]> {
    return this.request<readonly KimaiActivityRecord[]>(context, "GET", "/activities", {
      query: toQuery(query),
    });
  }

  async getActivity(
    context: IntegrationRequestContext,
    id: number,
  ): Promise<KimaiActivityRecord> {
    return this.request<KimaiActivityRecord>(context, "GET", `/activities/${id}`);
  }

  async createActivity(
    context: IntegrationRequestContext,
    body: KimaiActivityWriteBody,
  ): Promise<KimaiActivityRecord> {
    return this.request<KimaiActivityRecord>(context, "POST", "/activities", {
      body,
    });
  }

  async updateActivity(
    context: IntegrationRequestContext,
    id: number,
    body: KimaiActivityWriteBody,
  ): Promise<KimaiActivityRecord> {
    return this.request<KimaiActivityRecord>(context, "PATCH", `/activities/${id}`, {
      body,
    });
  }

  // --- Customers ---

  async listCustomers(
    context: IntegrationRequestContext,
    query?: KimaiListQuery,
  ): Promise<readonly KimaiCustomerRecord[]> {
    return this.request<readonly KimaiCustomerRecord[]>(context, "GET", "/customers", {
      query: toQuery(query),
    });
  }

  async getCustomer(
    context: IntegrationRequestContext,
    id: number,
  ): Promise<KimaiCustomerRecord> {
    return this.request<KimaiCustomerRecord>(context, "GET", `/customers/${id}`);
  }

  async createCustomer(
    context: IntegrationRequestContext,
    body: KimaiCustomerWriteBody,
  ): Promise<KimaiCustomerRecord> {
    return this.request<KimaiCustomerRecord>(context, "POST", "/customers", {
      body,
    });
  }

  async updateCustomer(
    context: IntegrationRequestContext,
    id: number,
    body: KimaiCustomerWriteBody,
  ): Promise<KimaiCustomerRecord> {
    return this.request<KimaiCustomerRecord>(context, "PATCH", `/customers/${id}`, {
      body,
    });
  }

  // --- Projects ---

  async listProjects(
    context: IntegrationRequestContext,
    query?: KimaiListQuery,
  ): Promise<readonly KimaiProjectRecord[]> {
    return this.request<readonly KimaiProjectRecord[]>(context, "GET", "/projects", {
      query: toQuery(query),
    });
  }

  async getProject(
    context: IntegrationRequestContext,
    id: number,
  ): Promise<KimaiProjectRecord> {
    return this.request<KimaiProjectRecord>(context, "GET", `/projects/${id}`);
  }

  async createProject(
    context: IntegrationRequestContext,
    body: KimaiProjectWriteBody,
  ): Promise<KimaiProjectRecord> {
    return this.request<KimaiProjectRecord>(context, "POST", "/projects", {
      body,
    });
  }

  async updateProject(
    context: IntegrationRequestContext,
    id: number,
    body: KimaiProjectWriteBody,
  ): Promise<KimaiProjectRecord> {
    return this.request<KimaiProjectRecord>(context, "PATCH", `/projects/${id}`, {
      body,
    });
  }

  // --- Tags ---

  async listTags(
    context: IntegrationRequestContext,
    query?: KimaiListQuery,
  ): Promise<readonly KimaiTagRecord[] | readonly string[]> {
    return this.request<readonly KimaiTagRecord[] | readonly string[]>(
      context,
      "GET",
      "/tags",
      { query: toQuery(query) },
    );
  }

  async getTag(
    context: IntegrationRequestContext,
    id: number,
  ): Promise<KimaiTagRecord> {
    return this.request<KimaiTagRecord>(context, "GET", `/tags/${id}`);
  }

  async createTag(
    context: IntegrationRequestContext,
    body: KimaiTagWriteBody,
  ): Promise<KimaiTagRecord | string> {
    return this.request<KimaiTagRecord | string>(context, "POST", "/tags", {
      body,
    });
  }

  async updateTag(
    context: IntegrationRequestContext,
    id: number,
    body: KimaiTagWriteBody,
  ): Promise<KimaiTagRecord> {
    return this.request<KimaiTagRecord>(context, "PATCH", `/tags/${id}`, {
      body,
    });
  }

  async deleteTag(context: IntegrationRequestContext, id: number): Promise<void> {
    await this.request(context, "DELETE", `/tags/${id}`);
  }

  private async request<T>(
    context: IntegrationRequestContext,
    method: IntegrationHttpMethod,
    path: string,
    options: {
      readonly query?: Record<string, string | number | boolean>;
      readonly body?: unknown;
    } = {},
  ): Promise<T> {
    const auth = await this.getAuth();
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Correlation-Id": context.correlationId,
    };

    if (auth.kind === "bearer") {
      headers.Authorization = `Bearer ${auth.token}`;
    } else {
      headers["X-AUTH-USER"] = auth.username;
      headers["X-AUTH-TOKEN"] = auth.apiPassword;
    }

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const startedAt = Date.now();
    const response = await this.client.request<T>({
      context,
      method,
      path,
      headers,
      query: options.query,
      body: options.body,
    });
    this.lastLatencyMs = Date.now() - startedAt;
    return response.data;
  }
}
