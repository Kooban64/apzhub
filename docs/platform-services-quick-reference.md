# APZHUB Platform Service Layer quick reference

One-page lookup derived from [009](./009-platform-service-layer-integration-framework.md) and [027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md). **009** = PSL architecture. **027** = Platform Service SDK, `service.yaml`, Service Registry.

## Position (mandatory — no bypass)

```
Desktop Framework → Platform Module → Platform Service Layer → Connector → Engine
```

Modules **only** call Platform Services. Services **only** call Connectors.

## Philosophy

Users and modules never touch backends · business logic independent of engines · connectors replaceable · identical integration patterns.

## Platform Service responsibilities

Orchestration · workflows · validation · **permission enforcement** · data transform · audit · notifications · search indexing · caching · transaction coordination · connector orchestration · events · business rules

**No backend-specific logic** inside services.

## Service categories

**Core:** Identity · Permission · Audit · Search · Configuration · Notification · Telemetry · Feature Flags · Logging · Workspace

**Shared (domain):** Project · Support · Document · Automation · Analytics · Testing · Monitoring · Compliance

## Interface-first

Every service starts with an **interface** — modules depend on interfaces only (mock, swap, test).

## Standard workflow pattern

```
Gateway (auth/authz/validate) → validate user/permissions/rules → execute connector(s) → audit → notify → index search → publish event → standard response envelope → client
```

Validate **before** backend calls.

## Data mapping

`Platform Model ↔ Connector Model ↔ Backend Model` — backend models **never** reach UI.

## Multi-connector orchestration

One service may coordinate domain connector + notification + search + audit + workflow connectors.

## Cross-system coordination

Services coordinate multi-engine actions (e.g. create employee → identity, projects, support, documents, time, notify, audit, search).

## Retries

Retry · backoff · queue · recovery · user notification — in **services or connectors**, not UI.

## Cross-cutting (centralised in services — not modules)

| Concern         | Owner                                                                |
| --------------- | -------------------------------------------------------------------- |
| Search indexing | Platform Service                                                     |
| Audit events    | Platform Service (automatic)                                         |
| Notifications   | Platform Service (when to fire)                                      |
| Events          | Platform Service (publish on significant actions)                    |
| Caching         | Service (metadata, permissions, nav — not duplicate source of truth) |
| Errors          | Connector translate → service presents platform-standard             |

## Security (every service)

Auth · permission checks · policy evaluation · input validation · output sanitisation · audit · logging

## Background jobs

OCR · reports · provisioning · bulk import · exports · notifications — async, non-blocking.

Full framework: [012](./012-event-driven-architecture-background-processing-workflow-framework.md) — event categories, job states, retries, DLQ, scheduled jobs, workflows, correlation IDs.

## Service registration

Name · capabilities · version · dependencies · health · configuration — dynamic discovery.

## Observability

Health · metrics · latency · error rates · connector status · queue depth · retries.

## Versioning

Stable contracts · version on breaking changes · connector upgrades must not break modules.

## Testing

Unit · integration · mock connector · contract · performance · failure scenarios · Playwright for user journeys — **no live engine required**.

## Development rules (architectural defects if violated)

| Allowed             | Forbidden                          |
| ------------------- | ---------------------------------- |
| Module → Service    | Module → Connector                 |
| Service → Connector | Module → Backend                   |
| Connector → Engine  | Service → Backend (skip connector) |

## Acceptance

All module traffic via PSL · centralised business logic · consistent audit/search/notify/events · testable services · swappable connectors.
