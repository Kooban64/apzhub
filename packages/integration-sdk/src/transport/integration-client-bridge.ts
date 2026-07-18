import type {
  IntegrationClient,
  IntegrationRequestOptions,
  IntegrationResponse,
} from "../client/types";
import { createTransportClient } from "./http-transport";
import { isAbortError } from "./policies";
import type {
  CreateHttpIntegrationClientOptions,
  FetchFn,
  TransportClient,
  TransportResponse,
} from "./types";

/**
 * Bridge implementing IntegrationClient via the shared HTTP transport.
 * Behaviour matches PlaneFetchClient / ZammadFetchClient for migration parity.
 */
export class HttpIntegrationClient implements IntegrationClient {
  private readonly transport: TransportClient;
  private readonly errorLabel: string;
  private readonly timeoutMs: number;

  constructor(options: CreateHttpIntegrationClientOptions) {
    this.errorLabel = options.errorLabel ?? "API";
    this.timeoutMs = options.timeoutMs;
    this.transport = createTransportClient({
      baseUrl: options.apiBaseUrl,
      timeout: { overallMs: options.timeoutMs },
      fetchFn: options.fetchFn,
      defaultHeaders: options.defaultHeaders,
      // Adapter migration default: retries disabled
      retry: options.retry ?? { maxAttempts: 1 },
      // Do not add Accept-Encoding by default — preserves prior client header set
      compression: { acceptEncoding: [], autoDecompress: true },
    });
  }

  async request<TResponse>(
    options: IntegrationRequestOptions,
  ): Promise<IntegrationResponse<TResponse>> {
    const startedAt = Date.now();

    try {
      const response = await this.transport.request<TResponse>({
        method: options.method,
        path: options.path,
        query: options.query,
        headers: {
          Accept: "application/json",
          ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
        },
        body:
          options.body !== undefined
            ? { kind: "json", json: options.body }
            : { kind: "empty" },
        timeoutMs: options.timeoutMs ?? this.timeoutMs,
        context: {
          correlationId: options.context.correlationId,
          tenantId: options.context.tenantId,
        },
      });

      const data = decodeIntegrationData<TResponse>(response);

      if (!response.ok) {
        const error = new Error(
          `${this.errorLabel} API request failed with status ${response.status}`,
        );
        Object.assign(error, {
          statusCode: response.status,
          body: data,
        });
        throw error;
      }

      return {
        status: response.status,
        data,
        headers: response.headers,
        durationMs:
          response.durationMs > 0 ? response.durationMs : Date.now() - startedAt,
        correlationId: options.context.correlationId,
      };
    } catch (error) {
      if (isAbortError(error)) {
        const timeoutError = new Error(`${this.errorLabel} API request timed out`);
        Object.assign(timeoutError, { timeout: true });
        throw timeoutError;
      }
      throw error;
    }
  }
}

function decodeIntegrationData<TResponse>(
  response: TransportResponse<TResponse>,
): TResponse {
  // Parity with PlaneFetchClient / ZammadFetchClient: text() then JSON.parse or {}
  if (response.text !== undefined) {
    return response.text ? (JSON.parse(response.text) as TResponse) : ({} as TResponse);
  }

  if (response.kind === "empty") {
    return {} as TResponse;
  }

  return (response.data ?? {}) as TResponse;
}

export function createHttpIntegrationClient(
  options: CreateHttpIntegrationClientOptions,
): IntegrationClient {
  return new HttpIntegrationClient(options);
}

export type { FetchFn, CreateHttpIntegrationClientOptions };
