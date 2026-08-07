# Context Composition Contract

| Field      | Value                               |
| ---------- | ----------------------------------- |
| Programme  | APZHUB-CONTEXT-000                  |
| Status     | **COMPLETE** (await Owner Approval) |
| Timestamp  | 20260806T131000Z                    |
| Capability | **Enterprise Context**              |

## What Context is

Enterprise Context is the platform capability that **composes** the right enterprise information around a current piece of work **without changing ownership**.

It answers, for a work object (or equivalent focus):

> **What do I need to know before I continue?**

Composition is a **read-oriented assembly of references and attributed projections** from participating Systems of Record / capabilities.

## What Context is not

| Not Context                            | Why                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------ |
| A System of Record                     | SoRs own truth                                                           |
| A document / ticket / policy store     | Those remain product SoRs                                                |
| A search engine                        | Search may consume or assist presentation later; it is not Context       |
| An AI assistant                        | AI may reason over composed context later; it is not Context             |
| A dashboard destination                | Context appears where work happens; it is not a ninth workspace identity |
| A synchronisation bus that copies data | Composition ≠ duplication                                                |
| A replacement for product UIs          | Products remain authoritative for their own work                         |

## Composition rules

1. **Compose by reference** — Context points at provider-owned entities; it does not absorb them.
2. **Never duplicate SoR truth** — no second authoritative copy of projects, tickets, files, obligations, memory, etc.
3. **Attribute every fragment** — each composed item carries source product / capability identity.
4. **Fail closed on ownership** — if a provider cannot contribute safely, omit that slice; do not invent truth.
5. **Permission-respecting** — composition never elevates access beyond what the user may see in source products.
6. **Presentation-agnostic** — the same composition may surface as panel, API, mobile, notification, or future AI; presentation is not the contract.
7. **Work-centred** — composition is keyed by a focus work object (or authorised focus type), not by a global “context dump.”

### Authorised focus types (CONTEXT-002 amendment)

| Focus type  | Typical consumer |
| ----------- | ---------------- |
| `project`   | APZ Projects     |
| `workflow`  | APZ Workflow     |
| `support`   | APZ Support      |
| `knowledge` | APZ Knowledge    |

Additive only — composition rules above are unchanged.

## Ownership rules

| Concern                        | Owner                                      |
| ------------------------------ | ------------------------------------------ |
| Enterprise truth per datum     | Source product SoR                         |
| Composition contract           | Platform (this programme)                  |
| Provider contribution shape    | Provider product (under Provider Contract) |
| Consumer request / display     | Consumer product (under Consumer Contract) |
| Cached / ephemeral projections | Non-authoritative; never SoR               |

## Lifetime of composed context

| Aspect                          | Rule                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| Authority lifetime              | Lives only as long as sources remain authoritative                                   |
| Ephemeral assembly              | A composed view may be short-lived (request / session / focus)                       |
| Stale projections               | Must be refreshable or clearly marked; never treated as SoR                          |
| Persistence of composition      | May persist **references and attribution**, not duplicate business payloads as truth |
| Deletion / retirement in source | Composition must not resurrect retired truth as current                              |

## Consumer expectations

Consumers may expect:

- Attributed fragments from authorised providers for the focus object
- Honest absence when a provider has nothing relevant or access is denied
- Traceability to source product and, where applicable, source entity
- No requirement to know engine or adapter identity

Consumers must not expect:

- Completeness across all enterprise data
- Write-back through Context (writes go to owning products)
- Context as an audit SoR or legal record of record

## Constitutional anchors

[../framework/APZHUB-CONSTITUTIONAL-ARCHITECTURAL-PRINCIPLES.md](../framework/APZHUB-CONSTITUTIONAL-ARCHITECTURAL-PRINCIPLES.md)
