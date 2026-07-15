/**
 * Search metrics / logger wrappers — compose integration-sdk observability.
 */

import type {
  CircuitBreakerState,
  IntegrationError,
  IntegrationLogFields,
  IntegrationLogger,
  IntegrationMetrics,
  IntegrationMetricsSummary,
  MetricLabels,
  RequestMetricOptions,
} from "@apzhub/integration-sdk";

export const SEARCH_METRIC_NAMES = {
  operationsTotal: "search.integration.operations.total",
  notImplementedTotal: "search.integration.not_implemented.total",
  capabilityChecksTotal: "search.integration.capability_checks.total",
  validationTotal: "search.integration.validation.total",
} as const;

export class SearchMetrics {
  constructor(private readonly delegate: IntegrationMetrics) {}

  recordRequest(options: RequestMetricOptions): void {
    this.delegate.recordRequest({
      ...options,
      operation: options.operation
        ? `search.${options.operation}`
        : "search.operation",
      labels: {
        plane: "search_integration",
        ...(options.labels ?? {}),
      },
    });
  }

  recordError(error: IntegrationError): void {
    this.delegate.recordError(error);
  }

  recordCircuitBreakerTransition(state: CircuitBreakerState): void {
    this.delegate.recordCircuitBreakerTransition(state);
  }

  recordNotImplemented(operation: string, labels?: MetricLabels): void {
    this.delegate.recordRequest({
      durationMs: 0,
      success: true,
      operation: `search.not_implemented.${operation}`,
      labels: {
        plane: "search_integration",
        status: "NOT_IMPLEMENTED",
        ...(labels ?? {}),
      },
    });
  }

  getSummary(): IntegrationMetricsSummary {
    return this.delegate.getSummary();
  }

  getDelegate(): IntegrationMetrics {
    return this.delegate;
  }
}

export class SearchLogger {
  constructor(private readonly delegate: IntegrationLogger) {}

  debug(message: string, fields?: IntegrationLogFields): void {
    this.delegate.debug(message, this.withPlane(fields));
  }

  info(message: string, fields?: IntegrationLogFields): void {
    this.delegate.info(message, this.withPlane(fields));
  }

  warn(message: string, fields?: IntegrationLogFields): void {
    this.delegate.warn(message, this.withPlane(fields));
  }

  error(message: string, fields?: IntegrationLogFields): void {
    this.delegate.error(message, this.withPlane(fields));
  }

  getEntries() {
    return this.delegate.getEntries();
  }

  getDelegate(): IntegrationLogger {
    return this.delegate;
  }

  private withPlane(fields?: IntegrationLogFields): IntegrationLogFields {
    return {
      plane: "search_integration",
      ...(fields ?? {}),
    };
  }
}

export function createSearchMetrics(delegate: IntegrationMetrics): SearchMetrics {
  return new SearchMetrics(delegate);
}

export function createSearchLogger(delegate: IntegrationLogger): SearchLogger {
  return new SearchLogger(delegate);
}
