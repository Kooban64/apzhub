# Zammad Adapter (`@apzhub/integration-zammad`)

**Milestone:** OSS-102-08 (Wave 2 closed)  
**Package:** `integrations/zammad/` **v0.6.0** — **CERTIFIED_WITH_LIMITATIONS**  
**Integration ID:** `zammad`

---

## Purpose

Zammad CE integration adapter for APZHUB **Support**. Extends `IntegrationAdapterBase` and follows the certified [Reference Adapter Standard](../../docs/architecture/REFERENCE-ADAPTER-STANDARD.md).

**OSS-102-07** adds operational certification, compatibility reporting, readiness evaluation, health classification, feature detection, and structured operational reports. No new end-user business capabilities.

---

## Core services (`adapter.core`)

| Service                        | Access                                    | Notes                               |
| ------------------------------ | ----------------------------------------- | ----------------------------------- |
| Support Request                | `adapter.core.support`                    | lifecycle                           |
| Organizations / Groups / Users | `adapter.core.*`                          | CRUD / lookup                       |
| Articles                       | `adapter.core.articles`                   | notes/replies + attachment metadata |
| Search / History / Analytics   | `adapter.core.search\|history\|analytics` | OSS-102-05                          |
| Webhooks                       | `adapter.core.webhooks`                   | registration only                   |
| Events                         | `adapter.core.events`                     | translation only                    |
| Synchronisation                | `adapter.core.synchronisation`            | in-memory sync APIs                 |

## Operations (`adapter.operations`)

| API                               | Notes                                      |
| --------------------------------- | ------------------------------------------ |
| `certifyCapabilities()`           | Capability certification matrix            |
| `getCompatibilityMatrix()`        | Version / edition / feature report         |
| `classifyHealth()`                | HEALTHY / DEGRADED / LIMITED / UNAVAILABLE |
| `detectFeatures(ctx)`             | Safe optional endpoint probes              |
| `evaluateReadiness(ctx)`          | Structured readiness checks                |
| `buildOperationalReport(ctx)`     | Serialisable ops report                    |
| `getRuntimeDiagnosticsSnapshot()` | Secret-free diagnostics                    |

See [ZAMMAD-OPERATIONS.md](./ZAMMAD-OPERATIONS.md).

Also:

- [ZAMMAD-SYNC.md](./ZAMMAD-SYNC.md)
- [ZAMMAD-EVENTS.md](./ZAMMAD-EVENTS.md)
- [ZAMMAD-WEBHOOKS.md](./ZAMMAD-WEBHOOKS.md)
- [ZAMMAD-SEARCH.md](./ZAMMAD-SEARCH.md)
- [ZAMMAD-HISTORY.md](./ZAMMAD-HISTORY.md)
- [ZAMMAD-ANALYTICS.md](./ZAMMAD-ANALYTICS.md)
- [ZAMMAD-ARTICLES.md](./ZAMMAD-ARTICLES.md)

---

## Architecture path

```text
adapter.core.* / adapter.operations
  → ZammadCoreServices / ZammadOperationsService
  → ZammadOperationRunner → ZammadRestClient → SDK createHttpIntegrationClient → Zammad CE REST
```

---

## Capabilities

### Implemented core

`support`, `organizations`, `groups`, `users`, `articles`, `search`, `history`, `analytics`, `webhooks`, `events`, `synchronisation`

### Deferred placeholders

`attachments` (binary) — not certified

---

## Diagnostics (secret-free)

Includes `syncEventsCapability` and `operationsCapability` with:

- webhook / sync / events registration flags
- operational health level and compatibility status
- certified capability count
- sync/webhook readiness
- circuit-breaker state
- configuration validation flag

---

## Version compatibility

- Minimum supported: **6.3.0**
- Verified family: **6.3.0 – 6.5.x**
- Community Edition first

---

## Explicit exclusions (OSS-102-07)

No PlatformService · No HTTP routes · No UI · No Platform Event Bus · No webhook ingress · No notifications · No workers · No schedulers · No persistence · No OAuth · No SDK redesign · No new business capabilities

---

## Related

- [OSS-102-07 Completion Report](../../docs/sprint/OSS-102-07-completion-report.md)
- [REFERENCE-ADAPTER-STANDARD.md](../../docs/architecture/REFERENCE-ADAPTER-STANDARD.md)
