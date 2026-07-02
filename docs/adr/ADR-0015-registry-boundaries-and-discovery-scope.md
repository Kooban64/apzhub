# ADR-0015 — Registry Boundaries and Discovery Scope

> **Status:** Accepted  
> **Date:** 2026-06-30  
> **Sprint:** SPR-002  
> **Decided by:** Project owner (Sprint 002 implementation approval)

## Problem

Without explicit boundaries, the registry may accumulate responsibilities that belong to Platform Services, IAM, or business modules.

## Decision

### Registry SHALL NOT

| Prohibited                | Belongs to                 |
| ------------------------- | -------------------------- |
| Contain business logic    | Platform Services (027)    |
| Call integrations         | Integration adapters (026) |
| Perform authentication    | IAM (007)                  |
| Execute workflows         | Application layer (003)    |
| Store user data           | Platform data layer (011)  |
| Replace Platform Services | Service layer (009)        |

The Registry **exists only to discover and manage platform capability metadata**.

### Discovery scope

The registry **shall discover** (index + validate) all of the following kinds:

| Kind              | Manifest                     | SPR-002                        |
| ----------------- | ---------------------------- | ------------------------------ |
| Modules           | `module.yaml`                | Index only (empty of business) |
| Platform Services | `service.yaml`               | Platform scaffolds             |
| Integrations      | `integration.yaml`           | Scaffold only                  |
| UI Components     | `component.yaml`             | SPR-001 components             |
| Themes            | `theme.yaml`                 | Light + dark                   |
| Commands          | envelope / module projection | Empty unless scaffold          |
| Events            | `event.yaml`                 | Platform scaffold              |
| Workers           | `worker.yaml`                | Schema only                    |
| Widgets           | module projection            | Empty                          |
| Dashboards        | module projection            | Empty                          |
| Reports           | module projection            | Empty                          |
| Feature flags     | `feature-flag.yaml`          | Future — schema placeholder    |
| AI providers      | `ai-provider.yaml`           | Future — schema placeholder    |

**Everything is discovered. Nothing is hardcoded** (except platform builtin dependency IDs: `identity`, `permissions`, `registry`, etc.).

## Alternatives

| Alternative                     | Why rejected               |
| ------------------------------- | -------------------------- |
| Hardcoded component list        | Violates ADR-0004          |
| Registry executes health probes | Observability sprint (014) |

## Consequences

- Discovery config lists all manifest filenames
- Empty indices are valid; discovery still runs
- ESLint boundary rules recommended in Phase 8
