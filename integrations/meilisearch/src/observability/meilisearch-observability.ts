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

export const MEILISEARCH_METRIC_NAMES = {
  operationsTotal: "search.meilisearch.operations.total",
  notSupportedTotal: "search.meilisearch.not_supported.total",
  errorsTotal: "search.meilisearch.errors.total",
} as const;

export class MeilisearchMetrics {
  constructor(private readonly delegate: IntegrationMetrics) {}

  recordRequest(options: RequestMetricOptions): void {
    this.delegate.recordRequest({
      ...options,
      operation: options.operation
        ? `meilisearch.${options.operation}`
        : "meilisearch.operation",
      labels: {
        plane: "search_meilisearch",
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

  recordNotSupported(feature: string, labels?: MetricLabels): void {
    this.delegate.recordRequest({
      durationMs: 0,
      success: true,
      operation: `meilisearch.not_supported.${feature}`,
      labels: {
        plane: "search_meilisearch",
        status: "NOT_SUPPORTED",
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

export class MeilisearchLogger {
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
      plane: "search_meilisearch",
      ...(fields ?? {}),
    };
  }
}

export function createMeilisearchMetrics(delegate: IntegrationMetrics): MeilisearchMetrics {
  return new MeilisearchMetrics(delegate);
}

export function createMeilisearchLogger(delegate: IntegrationLogger): MeilisearchLogger {
  return new MeilisearchLogger(delegate);
}
