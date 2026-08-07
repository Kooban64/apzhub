# Context Consumer Contract

| Field     | Value                               |
| --------- | ----------------------------------- |
| Programme | APZHUB-CONTEXT-000                  |
| Status    | **COMPLETE** (await Owner Approval) |
| Timestamp | 20260806T131000Z                    |

## Consumer role

A **Context Consumer** is a product (or authorised surface) that asks Enterprise Context for composed information about a **focus** (e.g. a Project), and presents or acts on the result **without becoming dependent on specific provider internals**.

## Core rule

> **Consumers ask for context. They do not query individual Systems of Record directly for the purpose of Enterprise Context composition.**

Direct SoR access for a product’s **own** primary work remains normal (Projects reads projects).  
Cross-product “what else do I need to know?” goes through Context Composition.

## Consumer obligations

1. Supply a clear **focus** (type + identifier) and user/security context.
2. Treat returned fragments as **non-authoritative projections** with attribution.
3. Never persist composed payloads as a new SoR.
4. Never assume a particular provider always participates.
5. Render absence and failure honestly (Quality Principles).
6. Route writes / actions back to the **owning** product — Context is not a write API for foreign SoRs.
7. Remain presentation-agnostic at the contract level (panel today; other channels later).

## Consumer must not

| Forbidden                                                 | Why                                 |
| --------------------------------------------------------- | ----------------------------------- |
| Hard-code per-engine queries for “context”                | Breaks technology independence      |
| Bypass Context to scrape sibling products for composition | Breaks provider/consumer separation |
| Treat Context as search or AI                             | Different capabilities              |
| Hide source attribution                                   | Traceability                        |
| Expand access beyond user grants                          | Security                            |

## Independence from providers

Consumers depend on the **Composition Contract**, not on:

- which providers are registered today,
- provider UI routes,
- provider engine APIs,
- provider-specific DTOs beyond the contribution shape.

When a new provider joins, consumers should gain fragments **without redesign** — only optional presentation polish.

## Initial consumer (planned first Auth)

**Projects** as focus host for v1 presentation — still a consumer of composition, not owner of foreign slices.

Other products may become consumers later under the same contract.
