# APZHUB — Constitutional Architectural Principles

| Field     | Value                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Status    | **CONSTITUTIONAL / IN FORCE**                                                                                                 |
| Timestamp | 20260806T131000Z                                                                                                              |
| Authority | Product Board — Architecture Era closed; Product Era active                                                                   |
| Kind      | Permanent principles — survive 5–10 years; everything else may evolve                                                         |
| Relation  | Complements [../../000-apzhub-engineering-constitution.md](../../000-apzhub-engineering-constitution.md); does not replace it |

## The three principles

### 1. Systems of Record own enterprise truth

Each datum has one authoritative owner. Products reference other SoRs. They never become a second truth for another product’s data.

### 2. Context is composed, never duplicated

Enterprise Context assembles references and projections from SoRs for the work at hand. It does not copy ownership, invent synchronised mirrors, or become a ninth SoR.

See [APZHUB-CONTEXT-COMPOSITION-PRINCIPLE.md](./APZHUB-CONTEXT-COMPOSITION-PRINCIPLE.md).

### 3. Enterprise capabilities are independent of implementation technology

Work, Service, Time, Information, Process, Decision, Governance, Organisational Memory, and Enterprise Context are defined by business purpose. Engines, adapters, and vendors are replaceable and invisible as product identity.

## Standing sentence

> **Enterprise value is created by composing trusted context, not by duplicating enterprise truth.**

## Evolution rule

Product features, UX, AI, providers, and presentations may change.  
These three principles do not — without explicit Owner / constitutional amendment.

## Architecture closure

[APZHUB-ARCHITECTURE-CLOSURE-001](../apzhub-architecture-closure-001/OWNER-DECISION.md) **APPROVED**

Architecture is a **governed asset**, not a workstream.

> **No architectural artefact shall be created solely because one might be useful. Every new architectural artefact must be justified by implementation evidence.**
