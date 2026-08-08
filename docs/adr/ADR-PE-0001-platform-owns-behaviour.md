# ADR-PE-0001 — Platform Owns Behaviour

| Field     | Value                                        |
| --------- | -------------------------------------------- |
| Status    | **Accepted** · **Ratified** (Foundation RC1) |
| Date      | 2026-08-08                                   |
| Programme | APZHUB Platform Evolution — Programme 001    |
| Authority | Owner Decision (APZPE-002 Accepted)          |

## Context

Platform Evolution elevates cross-cutting capabilities into reusable **APZ Platform Engines (APE)**. Without a clear ownership rule, business logic risks leaking into providers, and cross-cutting behaviour risks being duplicated inside products.

## Decision

> **Products own business capabilities. Platform Engines own cross-cutting behaviour. Providers own implementation.**

| Layer                         | Owns                                    | Examples                               |
| ----------------------------- | --------------------------------------- | -------------------------------------- |
| **Product**                   | Business capability / identity          | Projects, Support, Knowledge, Time     |
| **APZ Platform Engine (APE)** | Cross-cutting behaviour                 | Notify, Search, Audit, Events, Command |
| **Provider**                  | Persistence / execution behind adapters | Plane, Zammad, Kimai, Metabase, n8n    |

Examples:

- **Projects** owns project management; product/platform services own project logic; **Plane** provides storage/execution.
- **Support** owns ticket management; **APE-Audit** owns auditing; **Zammad** provides ticket persistence/workflow execution.
- **APE-Notify** owns notifications for every product — products publish events; they do not implement notification subsystems.

## Consequences

- Never duplicate a cross-cutting capability inside a product when an APE exists or is inventoried.
- Providers remain replaceable via Integration SDK / APE-Integration.
- End-user product faces remain frozen; Evolution happens underneath.
- AI Gateway / RAG remain Phase 3 — not Platform Engines in Programme 001.

## Related

- Document 008 Modules & connectors
- Document 009 Platform Service Layer
- Document 026 Integration SDK
- [APZPE-002](../products/platform-evolution/engineering/APZPE-002-FINITE-ENGINE-INVENTORY.md)
