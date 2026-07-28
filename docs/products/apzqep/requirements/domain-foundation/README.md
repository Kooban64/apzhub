# APZQEP-ENG-020A — Requirements Domain Foundation

> **Programme:** APZQEP-ENG-020A  
> **Title:** Requirements Domain Foundation (Domain Skeleton)  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Status:** **ACCEPTED / CLOSED**  
> **Baseline:** APZQEP-ENG-010 — **ACCEPTED**  
> **Package:** `@apzhub/qep-requirements` **0.1.0**  
> **Path note:** Delivered under `requirements/domain-foundation/` to preserve the accepted **APZQEP-REQ-001** product-requirements pack at `requirements/`.

## Purpose

Establish the Requirements bounded context as a Domain-Driven Design skeleton: domain model, value objects, service/repository contracts, domain events, permission/navigation registration, and placeholder UI — **without** persistence, CRUD, APIs, workflows, or integrations.

## Pack

| Document          | Path                                           |
| ----------------- | ---------------------------------------------- |
| Domain model      | [DOMAIN-MODEL.md](./DOMAIN-MODEL.md)           |
| Value objects     | [VALUE-OBJECTS.md](./VALUE-OBJECTS.md)         |
| Domain events     | [EVENTS.md](./EVENTS.md)                       |
| Contracts         | [CONTRACTS.md](./CONTRACTS.md)                 |
| Permissions       | [PERMISSIONS.md](./PERMISSIONS.md)             |
| Architecture      | [ARCHITECTURE.md](./ARCHITECTURE.md)           |
| Completion report | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md) |
| Owner acceptance  | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)   |

## Scope boundary

| In scope                             | Out of scope                        |
| ------------------------------------ | ----------------------------------- |
| Domain objects & value objects       | Persistence / database / migrations |
| Domain & application interfaces      | Repository implementations          |
| Domain event type definitions        | Event bus wiring                    |
| Permission & navigation registration | Authz enforcement                   |
| Placeholder shell page               | Business UI / CRUD / REST / GraphQL |

## STOP

Programme **ACCEPTED / CLOSED**. Next authorised programme: **APZQEP-ENG-020B** — Requirements Persistence & CRUD Foundation. Do not silently amend this domain foundation.
