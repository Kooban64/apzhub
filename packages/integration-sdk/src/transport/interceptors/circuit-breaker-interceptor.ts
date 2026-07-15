import type { CircuitBreaker } from "../../resilience/types";
import { createIntegrationError } from "../../errors/factory";
import { IntegrationSdkError } from "../../errors/types";
import type {
  TransportExecutionContext,
  TransportInterceptor,
  TransportRequest,
  TransportResponse,
} from "../types";

/**
 * Optional circuit-breaker interceptor. Off by default for adapter migration —
 * adapters keep CB in operation runners. Does not duplicate CircuitBreaker logic.
 */
export function createCircuitBreakerInterceptor(
  circuitBreaker: CircuitBreaker,
): TransportInterceptor {
  return {
    name: "circuit-breaker",
    order: 0,
    onRequest(request: TransportRequest, _ctx: TransportExecutionContext) {
      if (!circuitBreaker.allowRequest()) {
        throw new IntegrationSdkError(
          createIntegrationError({
            category: "vendor_unavailable",
            code: "integration.transport.circuit_open",
            message: "Transport circuit breaker is open",
            correlationId: request.context?.correlationId ?? "transport",
            retryable: true,
          }),
        );
      }
      return request;
    },
    onResponse(response: TransportResponse) {
      if (response.ok) {
        circuitBreaker.recordSuccess();
      } else if (response.status >= 500) {
        circuitBreaker.recordFailure(
          createIntegrationError({
            category: "vendor_unavailable",
            code: "integration.transport.upstream_error",
            message: `Upstream status ${response.status}`,
            correlationId: "transport",
            retryable: true,
            vendorStatusCode: response.status,
          }),
        );
      }
      return response;
    },
    onError(error: unknown) {
      if (error instanceof IntegrationSdkError) {
        circuitBreaker.recordFailure(error.integrationError);
      } else {
        circuitBreaker.recordFailure(
          createIntegrationError({
            category: "internal",
            code: "integration.transport.error",
            message: error instanceof Error ? error.message : "Transport error",
            correlationId: "transport",
            retryable: true,
          }),
        );
      }
      return error;
    },
  };
}
