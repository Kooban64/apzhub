# APZQEP-ENG-050A — Test Specifications Engine Domain

| Field        | Value                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| Programme    | **APZQEP-ENG-050A**                                                                                    |
| Title        | Test Specifications Domain Model                                                                       |
| Architecture | **APZQEP-ARCH-011** **ACCEPTED**                                                                       |
| Package      | `@apzhub/qep-test-specifications` **0.1.0**                                                            |
| Status       | **ACCEPTED**                                                                                           |
| Acceptance   | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                                                           |
| Next         | **APZQEP-ENG-050B** — [engine pack](../engine/README.md) — **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |
| Nature       | Domain only under this programme — persistence/APIs delivered under ENG-050B                           |

## Purpose

Implement the Test Specifications bounded context as a pure domain model: aggregate, entities, value objects, lifecycle, versioning, policies, domain services, and event builders — fidelity to [APZQEP-ARCH-011](../../architecture/test-specifications/README.md).

## Documentation pack

| Document            | Path                                               |
| ------------------- | -------------------------------------------------- |
| Domain model        | [DOMAIN-MODEL.md](./DOMAIN-MODEL.md)               |
| Aggregate           | [AGGREGATE.md](./AGGREGATE.md)                     |
| Entities            | [ENTITIES.md](./ENTITIES.md)                       |
| Value objects       | [VALUE-OBJECTS.md](./VALUE-OBJECTS.md)             |
| Lifecycle           | [LIFECYCLE.md](./LIFECYCLE.md)                     |
| Versioning          | [VERSIONING.md](./VERSIONING.md)                   |
| Policies            | [POLICIES.md](./POLICIES.md)                       |
| Domain events       | [EVENTS.md](./EVENTS.md)                           |
| Domain services     | [SERVICES.md](./SERVICES.md)                       |
| Business invariants | [BUSINESS-INVARIANTS.md](./BUSINESS-INVARIANTS.md) |
| Relationships       | [RELATIONSHIPS.md](./RELATIONSHIPS.md)             |
| Completion report   | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)     |

## Scope boundary

| In scope (ENG-050A)                              | Out of scope                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| TestSpecification aggregate & lifecycle          | Persistence / repositories / PostgreSQL                                         |
| Entities, value objects, policies, pure services | REST APIs / Platform Service wiring                                             |
| Domain event builders                            | Event Bus publish                                                               |
| Domain + architecture-boundary tests             | Workbench / React / Next.js                                                     |
| Reference-only relationships                     | Ownership of Requirements / Trace / Verification / Cases / Execution / Evidence |

## Baselines

| Field        | Value                                       |
| ------------ | ------------------------------------------- |
| Platform     | APZHUB 1.4 CERTIFIED                        |
| Requirements | **1.0.0 CERTIFIED / FROZEN**                |
| Traceability | **1.0.0 CERTIFIED / FROZEN**                |
| Verification | **1.0.0 CERTIFIED / FROZEN**                |
| ARCH-011     | **ACCEPTED**                                |
| ENG-050A     | **ACCEPTED**                                |
| ENG-050B     | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

## STOP

APZQEP-ENG-050A is **ACCEPTED / CLOSED / COMPLETE**. Current gate is Owner Acceptance of **APZQEP-ENG-050B**. Workbench remains **NOT AUTHORISED**.
