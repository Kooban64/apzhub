# APZHUB Adapter Framework — Implementation

> **Milestone:** OSS-100-05  
> **Package:** `@apzhub/integration-sdk` v0.5.0  
> **Status:** Implemented

---

## Purpose

Document the **implemented** OSS-100-05 adapter foundation — `IntegrationAdapterBase`, dependency injection, capability registration, factory, and mock reference adapter.

---

## Architecture

```text
AdapterFactory
     │
     ├── CapabilityRegistration.register(manifest)
     ├── buildAdapterContext(configuration)
     └── new VendorAdapter(context, configuration)
              │
              └── IntegrationAdapterBase
                       ├── AuthenticationProvider
                       ├── ConnectionManager
                       ├── HealthProvider
                       ├── DiagnosticsProvider
                       ├── VersionProvider
                       ├── ErrorTranslator
                       ├── CircuitBreaker
                       ├── IntegrationMetrics
                       └── IntegrationLogger
```

---

## Backward compatibility

| Surface                                  | Status    |
| ---------------------------------------- | --------- |
| `AdapterBase` interface                  | Unchanged |
| `PlaceholderAdapterBase`                 | Unchanged |
| OSS-100-01–04 exports                    | Retained  |
| `IntegrationDiagnostics` optional fields | Unchanged |

New abstract class: `IntegrationAdapterBase` — vendor adapters extend this; does not replace the minimal interface.

---

## Gate unlocked

**OSS-101-04 (Plane adapter)** delivered — see [OSS-101-04 Completion Report](../sprint/OSS-101-04-completion-report.md) and [Plane Adapter Documentation](../../integrations/plane/docs/PLANE-ADAPTER.md).

---

## Related

- [Base Adapter Pattern](./APZHUB-Base-Adapter-Pattern.md)
- [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md)
- [OSS-100-05 Completion Report](../sprint/OSS-100-05-completion-report.md)
