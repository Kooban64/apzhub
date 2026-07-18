# APZHUB Platform Observability Architecture

**Programme:** APZOBSERVE  
**Milestone:** APZOBSERVE-001 — Platform Observability Foundation  
**Status:** Complete (foundation)

## Purpose

Defines the canonical Platform Observability System of Record for APZHUB.

This is **not** a Grafana, Prometheus, or Loki product. Those systems are future provider implementations beneath platform contracts.

## Layering

```text
Platform Consumers
        ↓
Observability Platform
        ↓
Provider Contracts (future)
        ↓
Observability Core
        ↓
Persistence
        ↓
PostgreSQL (metadata)
```

## Packages

| Package                       | Role                                                        |
| ----------------------------- | ----------------------------------------------------------- |
| `@apzhub/observe-contracts`   | Models, permissions, service ports                          |
| `@apzhub/observe-core`        | Validation, lifecycle, repository ports, foundation factory |
| `@apzhub/observe-persistence` | In-memory (tests) + PostgreSQL adapters                     |

## Ownership

**Owns (metadata):** services, health, readiness, liveness, diagnostics, metrics catalogue, dashboard registration, log source registration, trace catalogue, alert definitions/states, maintenance windows, incident references.

**Does not own:** Prometheus TSDB, Loki log storage, Grafana dashboard JSON runtime, AlertManager delivery, OpenTelemetry exporters.

## Persistence

- PostgreSQL tables `platform_observe_*` (migrations **0054** / **0055** RLS)
- Production requires explicit PostgreSQL — no silent in-memory fallback
- Tests may use in-memory when `allowInMemoryPersistence: true`

## Explicit exclusions (APZOBSERVE-001)

HTTP, Gateway, Platform Services, typed client, Workbench, Grafana/Prometheus/Loki/OTel/AlertManager integrations, Event Bus, AI.

## Next

**APZOBSERVE-002 — Platform Services, Gateway & Authorization** (await owner approval).
