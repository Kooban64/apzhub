# Error Translation & Observability (OSS-100-04)

**Package:** `@apzhub/integration-sdk` v0.4.0  
**Authority:** [Integration Error Translation Model](../../docs/architecture/APZHUB-Integration-Error-Translation-Model.md)

---

## ErrorTranslator

Centralised vendor error translation with mapper registration and SDK default fallbacks.

```typescript
import {
  createDefaultErrorTranslator,
  type VendorErrorMapper,
} from "@apzhub/integration-sdk";

const translator = createDefaultErrorTranslator();

translator.registerMapper({
  integrationId: "example-engine",
  map(input) {
    if (input.vendorCode === "RESOURCE_MISSING") {
      return {
        error: {
          category: "not_found",
          code: "example.resource.not_found",
          message: "Resource not found",
          retryable: false,
          correlationId: input.context.correlationId,
        },
        severity: "warning",
      };
    }
    return null; // fall through to SDK defaults
  },
});

const translated = translator.translate({
  statusCode: 404,
  vendorCode: "RESOURCE_MISSING",
  vendorMessage: "raw vendor detail — internal only",
  context: {
    correlationId: "corr-001",
    integrationId: "example-engine",
    operation: "fetchResource",
  },
});

// Platform-safe error
translated.error;

// Operator diagnostics — never expose to end users
translated.vendorDiagnostics;
```

### Default status mapping

| Status   | Category             |
| -------- | -------------------- |
| 401      | `authentication`     |
| 403      | `authorization`      |
| 404      | `not_found`          |
| 409      | `conflict`           |
| 422, 400 | `validation`         |
| 429      | `rate_limited`       |
| 502, 503 | `vendor_unavailable` |
| 504      | `timeout`            |

---

## Circuit breaker

In-memory circuit breaker with diagnostics for health and runtime reporting.

```typescript
import { createDefaultCircuitBreaker } from "@apzhub/integration-sdk/resilience";

const breaker = createDefaultCircuitBreaker({ failureThreshold: 5 });

if (breaker.allowRequest()) {
  try {
    // vendor call
    breaker.recordSuccess();
  } catch (error) {
    const translated = translator.translateUnknown(error, context);
    breaker.recordFailure(translated.error);
  }
}

breaker.getDiagnostics();
// state, failureCount, successCount, lastFailureAt, availabilityStatus, ...
```

Health check `circuit_breaker` reflects closed / half-open / open state.

---

## Metrics (interfaces only)

Pluggable metrics provider — no Prometheus/OpenTelemetry wiring.

```typescript
import {
  createInMemoryMetricsProvider,
  createDefaultIntegrationMetrics,
  STANDARD_INTEGRATION_METRIC_NAMES,
} from "@apzhub/integration-sdk/observability";

const provider = createInMemoryMetricsProvider();
const metrics = createDefaultIntegrationMetrics({
  provider,
  integrationId: "example-engine",
});

metrics.recordRequest({ durationMs: 120, success: true, operation: "list" });
metrics.recordError(translated.error);
metrics.getSummary();
```

Contracts: `Counter`, `Gauge`, `Histogram`, `Timer`, `MetricsProvider`.

---

## IntegrationLogger

Structured logging with correlation ID, request ID, operation, duration, and result.

```typescript
import {
  createDefaultIntegrationLogger,
  buildErrorLogFields,
} from "@apzhub/integration-sdk/observability";

const logger = createDefaultIntegrationLogger({
  integrationId: "example-engine",
  adapterId: "example-adapter",
});

logger.info("Integration request completed", {
  correlationId: "corr-001",
  requestId: "req-001",
  operation: "listResources",
  durationMs: 95,
  result: "success",
});

logger.error(
  "Integration request failed",
  buildErrorLogFields(translated.error, {
    correlationId: "corr-001",
    operation: "listResources",
    durationMs: 95,
  }),
);
```

Secrets and bearer tokens are redacted automatically.

---

## Runtime diagnostics API

`DiagnosticsProvider.collect()` now exposes:

| Field            | Description                           |
| ---------------- | ------------------------------------- |
| `health`         | Full health probe result              |
| `circuitBreaker` | Breaker state and counters            |
| `metrics`        | Request/error summary                 |
| `errors`         | Error category summary                |
| `registration`   | Connection and lifecycle registration |
| `version`        | Engine version compatibility block    |

All new fields are **optional** — backward compatible with OSS-100-03 consumers.

---

## Operations stack

`createIntegrationOperationsStack()` wires OSS-100-03 and OSS-100-04 providers:

- `errorTranslator`
- `circuitBreaker`
- `metrics` / `metricsProvider`
- `errorSummary`
- `logger`

See [HEALTH-DIAGNOSTICS-LIFECYCLE.md](./HEALTH-DIAGNOSTICS-LIFECYCLE.md) for OSS-100-03 providers.

---

## Out of scope (OSS-100-04)

- HTTP transport
- Prometheus / OpenTelemetry exporters
- Vendor-specific mappers (registered in adapter packages)
- Retry policy implementation (OSS-100-05+)
