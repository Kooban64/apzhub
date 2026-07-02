# APZHUB Platform Service SDK quick reference

Derived lookup for [027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md).

> **Document Version:** 1.0 · **Developer Specification · Mandatory**  
> PSL architecture: [009](./009-platform-service-layer-integration-framework.md). Platform SDK: [024](./024-apzhub-platform-sdk-development-framework.md). Modules: [025](./025-module-sdk-module-manifest-module-development-standard.md). Integrations: [026](./026-integration-sdk-adapter-framework-integration-manifest-specification.md).

## Core rule

**All business logic lives in Platform Services** — modules present; integrations communicate; workers run async jobs.

## Architectural position

```
Shell → Module → Platform Service → Integration SDK → External System
```

Only Platform Services coordinate business operations (009)

## Service categories

**Core platform:** identity · permissions · session · audit · notification · activity · search · settings · workspace · theme · configuration · event

**Business:** project · ticket · document · time · workflow · testing · analytics · compliance · monitoring

**Infrastructure:** file · queue · cache · storage · email · secret

User-facing names per 002 — `ProjectService`, not engine names

## Service owns

Business rules · validation · orchestration · transactions · permission/policy enforcement · audit · notifications · search updates · activity · events · job scheduling — **never presentation or raw integration**

## Manifest

`service.yaml` **before implementation** (024)

## Example manifest fields

`service` (id, name, version) · metadata (category, owner) · dependencies.platform · integrations · events.publishes · permissions · health · tests · documentation

## Service Registry (auto-discovery)

Service ID · name · version · category · dependencies · operations · events · health · docs · tests (011, 024)

## Dependency rules

**May depend on:** Platform/Shared Services · Platform/Event/Integration SDK

**Must never depend on:** Modules · UI · backend engines directly

Modules call **interfaces** only (025, 009)

## Business transaction (example)

Validate identity → permissions → business action → provision externals → publish events → notify → search → audit → return — all in service layer; async follow-up via events (012)

## Validation (before execution)

Input schema · business rules · permissions · org policies · dependency/integration availability (007, 013)

## Orchestration

Coordinate multiple integrations + platform services (e.g. employee onboarding) — via Integration SDK, not direct engines (026)

## Events

Publish immutable business events — Platform Services publish; modules don't notify/search/audit directly (012)

## Background processing

Schedule provisioning · imports · OCR · reports · sync — **never synchronous in request handlers** (012)

## Security (mandatory)

Authenticate · enforce permissions · policies · audit · protect sensitive data · validate inputs (010, 013)

## Observability (014)

Health · metrics · execution times · errors · queue usage · dependency status · correlation IDs (010)

## Configuration

Declarative schema · defaults · validation · env requirements · feature flags — no secrets in code (024, 013)

## Versioning

Current version · supported platform version · breaking changes · migration notes (015)

## Directory (`services/project-service/`)

`service.yaml` · README · CHANGELOG · `src/` (contracts, orchestrators, policies, validators, events, jobs, handlers, types) · `tests/` (unit, integration, contract, performance, regression) · `docs/` — `/services` monorepo (004)

## Testing (015)

Unit · integration · **contract** · **policy** · failure · performance · regression — high coverage on business logic

## Cursor workflow (9 steps)

Read 009, 024, 026, 027 → `service.yaml` → interfaces → business rules only → delegate integrations → publish events → tests → docs → validate registration — **no logic in modules/integrations · phase gate applies**

## Acceptance highlights

All business via services · auto-registration · centralised rules · replaceable integrations · health/metrics · consistent events · tested behaviour · synced docs · **no module/integration business logic** · **modules use interfaces only**
