# Plane Operations, Diagnostics & Certification

**Milestone:** OSS-101-09 (ops) · **Wave 1 certified:** OSS-101-10  
**Package:** `@apzhub/integration-plane` v0.6.0 — **APZHUB Reference Adapter**  
**Scope:** Operational quality only — no new end-user business capabilities; no PlatformService / HTTP / UI

---

## Purpose

Certify the Plane adapter as the **reference implementation** for future APZHUB integrations. Provides capability self-assessment, compatibility reporting, readiness checks, health classification, feature detection, and structured operational reports for future administration tooling.

Wave 1 closeout: [OSS-101-10 Wave 1 Certification](../../docs/sprint/OSS-101-10-Wave1-Certification.md) · [Reference Adapter Standard](../../docs/architecture/REFERENCE-ADAPTER-STANDARD.md).

---

## Public API

| API                                           | Description                                                     |
| --------------------------------------------- | --------------------------------------------------------------- |
| `adapter.operations.certifyCapabilities()`    | Capability self-assessment matrix                               |
| `adapter.operations.getCompatibilityMatrix()` | Version / edition / unsupported feature report                  |
| `adapter.detectFeatures(ctx)`                 | Optional endpoint probes (never fail startup for optional gaps) |
| `adapter.evaluateReadiness(ctx)`              | Structured readiness validation                                 |
| `adapter.operations.classifyHealth()`         | `HEALTHY` / `DEGRADED` / `LIMITED` / `UNAVAILABLE`              |
| `adapter.buildOperationalReport(ctx)`         | Aggregated report for ops tooling                               |
| `adapter.getRuntimeDiagnosticsSnapshot()`     | Safe runtime diagnostics (no secrets)                           |

---

## Health model

| Level         | Meaning                                                          |
| ------------- | ---------------------------------------------------------------- |
| `HEALTHY`     | Required capabilities available; provider reachable; auth valid  |
| `DEGRADED`    | Optional gaps, sync/webhook issues, or version warnings          |
| `LIMITED`     | Required capability unavailable or provider version incompatible |
| `UNAVAILABLE` | Provider down, auth invalid, or circuit breaker open             |

---

## Readiness model

Required checks: configuration, authentication, connectivity, capability registration, provider compatibility, sync configuration, metrics, logger.

Optional check: webhook configuration (warnings only).

---

## Compatibility

Supported Plane CE range: **0.23.0 – 0.24.x** (Community Edition first). Optional capabilities (`analytics`, `webhooks`) may be unavailable without failing startup.

---

## Reference patterns for future adapters

Documented on every operational report (`referencePatterns`):

1. Extend `IntegrationAdapterBase`
2. Keep vendor clients internal; expose `adapter.core` services
3. Register capabilities via the capability framework
4. Translate errors via `VendorErrorMapper`
5. Diagnostics without secrets
6. Optional capabilities degrade; required capabilities limit/unavailable
7. Feature-detect optional endpoints as metadata
8. Use operation runner for metrics/logging/circuit breaker
9. Expose operational reports (no UI required in adapter)
10. Keep PlatformService / HTTP / UI out of the adapter package

---

## Explicit exclusions

No PlatformService changes, HTTP routes, UI, webhook ingress, event bus, workers, scheduler, notifications, WebSockets, SSE, Zammad, or second adapter.

---

## SDK harness wrappers (OSS-100-09)

Thin wrappers in `src/harness/plane-harness.ts` adopt `@apzhub/integration-sdk/harness` without changing operations APIs:

| Export | Role |
| ------ | ---- |
| `getPlaneHarnessMetadata` | Declared certification subject for SDK engine |
| `createPlaneAdapterHarness` | SDK `AdapterHarness` with Plane fixtures |
| `certifyPlaneWithSdkHarness` | Runs SDK `certifyAdapter` **plus** existing `certifyPlaneCapabilities` / compatibility |

See [ADAPTER-HARNESS.md](../../packages/integration-sdk/docs/ADAPTER-HARNESS.md) · [ADR-0057](../../docs/adr/ADR-0057-sdk-harness-vs-adapter-operations-certification.md).

---

## Related

- [PLANE-ADAPTER.md](./PLANE-ADAPTER.md)
- [OSS-101-09 Completion Report](../../docs/sprint/OSS-101-09-completion-report.md)
- [OSS-100-09 Completion Report](../../docs/sprint/OSS-100-09-completion-report.md)
