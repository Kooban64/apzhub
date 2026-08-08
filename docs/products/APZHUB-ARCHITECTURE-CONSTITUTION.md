# APZHUB Architecture Constitution

| Field       | Value                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| Document    | **Architecture Constitution**                                                                                      |
| Kind        | Constitutional — principles only · **not** an implementation guide                                                 |
| Status      | **IN FORCE**                                                                                                       |
| Timestamp   | 20260808T233000Z                                                                                                   |
| Authority   | Owner direction after Platform Engine Foundation v1.0 · amended APS-002 (Law 6)                                    |
| Complements | Document 000 · Delivery Standard v1.0 · ADR-PE-0001 · [APZHUB-PLATFORM-IDENTITY.md](./APZHUB-PLATFORM-IDENTITY.md) |

---

## Purpose

This constitution records **truths that outlive every implementation**.

It does **not** describe packages, APIs, schemas, providers, or sprint plans.

When a proposal conflicts with this constitution, the constitution wins unless the Owner amends it deliberately.

---

## Identity

> **APZHUB is an Enterprise Work Platform that delivers business capabilities through APZ products, shared platform capabilities through certified APE engines, and implementation through interchangeable providers.**

Users experience **one platform**. Providers are never the product identity.

---

## Five architectural laws

### Law 1 — Products own business capabilities

Projects owns project management. Support owns tickets. Analytics owns analytics. Knowledge owns organisational memory. Time owns time capture. Workflow owns business journeys. APZQEP owns quality engineering.

**Never** move product business logic into the platform or into providers.

### Law 2 — APE owns shared capabilities

Search, notifications, audit, events, activity, realtime, configuration, feature flags, command, registry, integration — and future shared capabilities — belong to **APZ Platform Engines (APE)**.

**Never** duplicate a shared capability inside a product.

### Law 3 — Providers are replaceable

Plane, Zammad, Kimai, Metabase, Paperless, n8n — and successors — implement contracts. The platform owns the contract. Providers are interchangeable behind adapters.

**Never** couple products or user experience to a provider brand.

### Law 4 — The Delivery Standard governs engineering

Everything passes through:

> Assess → Accept → Engineer → Certify → Release → Learn → Close

**Never** bypass the Delivery Standard. **Never** invent a parallel methodology.

### Law 5 — Users see one platform

Users work in APZHUB and its products — not in Metabase, Zammad, Kimai, or Plane.

**Never** require end users to learn provider identity or leave the Workbench mental model for ordinary work.

### Law 6 — The Platform shall be intentionally smaller than the Products

Platforms accumulate responsibility over time. The Constitution actively resists that tendency.

A smaller platform is easier to certify, evolves more safely, remains provider-neutral, stays understandable, and avoids becoming a monolith.

**Never** grow the platform merely because a capability is useful. Prefer product ownership until the Two-Consumer Rule (or an explicit constitutional declaration) is met.

---

## Additional permanent truths

| Truth                                        | Meaning                                                                                                                                                                                 |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Never duplicate a capability**             | If two products need it, it is platform (APE / APS) — not forked per product                                                                                                            |
| **AI is never product-specific**             | Intelligence is a platform capability (Programme 003+), not a product-owned silo                                                                                                        |
| **Platform Evolution never breaks products** | Frozen Production Ready products remain usable without retraining                                                                                                                       |
| **No “version 2” of the platform**           | The platform evolves through programmes — Foundation → Services → Intelligence → Operational Evolution                                                                                  |
| **Ask “Does this belong in the platform?”**  | Prefer exclusion until shared need and ownership are clear                                                                                                                              |
| **Two-Consumer Rule**                        | A capability belongs in the platform only if **at least two Production Ready products** genuinely consume it, **or** this Constitution explicitly declares it a platform responsibility |
| **Smaller platform**                         | Law 6 — resist accumulation; certify a coherent small layer rather than an expanding monolith                                                                                           |

---

## Platform lifecycle

```text
Assessment
    ↓
Inventory
    ↓
Foundation          (Programme 001 — COMPLETE)
    ↓
Services            (Programme 002 — APS-002 Accepted · APS-003 Engineering OPEN)
    ↓
Intelligence        (Programme 003 — deferred)
    ↓
Operational Evolution
```

There is no “APZHUB 2.0” rewrite. There is disciplined evolution.

---

## What this constitution forbids

- Business logic in providers or connectors
- Parallel notification / search / audit subsystems inside products
- Provider-branded user journeys as the default
- Methodology invention outside Delivery Standard v1.0
- Opening engineering without an Owner-accepted finite inventory
- Jumping to AI to compensate for missing shared context

---

## Amendment

Only the Owner may amend this constitution. Amendments require written Owner decision. Convenience and enthusiasm are not grounds for drift.

---

## Closing

The major structural decisions are in place. Future work **protects** this architecture while expanding capabilities — it does not rediscover what APZHUB is.
