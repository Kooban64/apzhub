# APZHUB Integration Error Translation & Observability — Implementation

> **Milestone:** OSS-100-04  
> **Package:** `@apzhub/integration-sdk` v0.4.0  
> **Status:** Implemented

---

## Purpose

Document the **implemented** OSS-100-04 foundation — error translation, circuit breaker diagnostics, metrics contracts, structured logging, and expanded runtime diagnostics.

---

## Architecture

```text
Vendor error
     │
     ▼
ErrorTranslator ──► IntegrationError (platform-safe)
     │                      │
     │                      ├──► IntegrationMetrics.recordError
     │                      └──► IntegrationLogger (structured)
     │
     └──► VendorErrorDiagnostics (operator-only)

CircuitBreaker ──► HealthProvider (circuit_breaker check)
              └──► DiagnosticsProvider (circuitBreaker field)

MetricsProvider ◄── IntegrationMetrics ◄── DiagnosticsProvider (metrics summary)
ErrorSummaryTracker ◄────────────────────── DiagnosticsProvider (errors summary)
```

---

## Modules

| Module              | Path                               | Responsibility                              |
| ------------------- | ---------------------------------- | ------------------------------------------- |
| Error translation   | `src/errors/translation/`          | Mapper registry, defaults, severity         |
| Resilience          | `src/resilience/`                  | Circuit breaker state machine + diagnostics |
| Observability       | `src/observability/`               | Metrics contracts, integration logger       |
| Runtime diagnostics | `src/diagnostics/runtime-types.ts` | Extended diagnostics payload                |

---

## Backward compatibility

- All OSS-100-01–03 exports retained
- `IntegrationDiagnostics` extended with **optional** fields only
- Health without circuit breaker configured reports `pass` (available)
- Placeholder diagnostics unchanged

---

## Out of scope (OSS-100-04)

- HTTP REST client
- Prometheus / OpenTelemetry
- Vendor mappers (Plane, Zammad, etc.)
- RetryPolicy / RateLimitPolicy
- AdapterBase (OSS-100-05)

---

## Related

- [Error Translation Model](./APZHUB-Integration-Error-Translation-Model.md)
- [Health & Diagnostics Model](./APZHUB-Integration-Health-Diagnostics-Model.md)
- [OSS-100-04 Completion Report](../sprint/OSS-100-04-completion-report.md)
