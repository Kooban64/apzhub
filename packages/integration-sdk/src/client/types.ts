import type { IntegrationRequestContext } from "../types";

export type IntegrationHttpMethod =
  "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export interface IntegrationRequestOptions {
  readonly context: IntegrationRequestContext;
  readonly method: IntegrationHttpMethod;
  readonly path: string;
  readonly query?: Readonly<Record<string, string | number | boolean>>;
  readonly body?: unknown;
  readonly headers?: Readonly<Record<string, string>>;
  readonly idempotencyKey?: string;
  readonly timeoutMs?: number;
}

export interface IntegrationResponse<TData> {
  readonly status: number;
  readonly data: TData;
  readonly headers: Readonly<Record<string, string>>;
  readonly durationMs: number;
  readonly correlationId: string;
}

/** Abstract transport facade — HTTP implementation via `@apzhub/integration-sdk/transport`. */
export interface IntegrationClient {
  request<TResponse>(
    options: IntegrationRequestOptions,
  ): Promise<IntegrationResponse<TResponse>>;
}
