# APZHUB Operational Resilience Architecture (M8-06)

## Purpose

Keep the platform operating under dependency failure. Resilience complements security and observability — it does not replace them.

## Components

`OperationalResilienceService` in `@apzhub/platform-security`:

| Probe             | Intent                                                     |
| ----------------- | ---------------------------------------------------------- |
| Liveness          | Process is running — always healthy when handler responds  |
| Readiness         | Database, Redis, environment validation, runtime bootstrap |
| Health            | Aggregated status + dependency signals                     |
| Recovery guidance | Actionable steps when checks fail                          |

## Dependency diagnostics

- PostgreSQL — `checkDatabaseHealth()` from `@apzhub/config`
- Redis — `checkRedisHealth()` from `@apzhub/shared`
- Runtime — bootstrap result from `ensurePlatformRuntimeReady()`
- Environment — `EnvironmentValidationService`

## Consolidated operational view

`OperationalDiagnosticsService.getConsolidatedDiagnostics()` merges signals from Runtime, Identity, Authorization, Operations, Personalisation, Governance, Persistence, API, Workbench, Law Platform, and Trust Accounting (product-scoped placeholder).

Loaded in `apps/web/lib/operational-diagnostics.ts` and exposed via:

- `GET /api/platform/v1/security/diagnostics`
- `GET /api/platform/v1/operations/summary` (`consolidatedDiagnostics`)

## Operations Console

**Resilience** section: system health, readiness, liveness, dependency table, recovery guidance.

## Deferred

Disaster recovery automation, cloud-specific failover, multi-region replication — future milestones.

## References

- [Disaster Recovery Overview](../governance/APZHUB-Disaster-Recovery-Overview.md)
- [Incident Response Guide](../governance/APZHUB-Incident-Response-Guide.md)
