# APZHUB Platform Evolution — Programme Charter

| Field              | Value                                                                           |
| ------------------ | ------------------------------------------------------------------------------- |
| Programme          | **APZHUB Platform Evolution**                                                   |
| Kind               | **New programme** — not a continuation of the Original Portfolio                |
| Status             | **OPEN** — Assessment / Inventory (await Owner Accept of inventory)             |
| Timestamp          | 20260808T211500Z                                                                |
| Prerequisite       | Original Portfolio COMPLETE · PORT-005 **IN FORCE**                             |
| Delivery Standard  | [APZHUB Delivery Standard v1.0](../APZHUB-DELIVERY-STANDARD.md) (**IMMUTABLE**) |
| Portfolio products | **FROZEN** — Production Ready baselines unchanged                               |

---

## Objective

Transform APZHUB from a collection of Production Ready products into an **integrated Enterprise Work Platform** through shared Platform Engines, provider abstraction, and cross-product capabilities — **without requiring end-user retraining**.

---

## Supreme principle

> **Platform Evolution must never require end-user retraining.**

Users continue to use APZ Projects, Support, Analytics, Knowledge, Workflow, Time, and APZQEP. Improvements happen underneath the products.

---

## Four architectural layers

```text
Workbench
    ↓
Products          (frozen Production Ready faces)
    ↓
Platform Engines  (APZHUB-owned — this programme)
    ↓
Provider Layer    (Plane · Zammad · Kimai · Metabase · Paperless · n8n · …)
```

Products never call providers directly. Path remains Module → Platform Service → Connector → Provider (008 / Integration SDK).

---

## Programme phases (strategic)

| Phase                              | Focus                                  | AI                              |
| ---------------------------------- | -------------------------------------- | ------------------------------- |
| **1 — Platform Engine Foundation** | Shared engines every product consumes  | **Out of scope**                |
| **2 — Product Engines**            | Enrich each product via shared engines | Out of scope unless inventoried |
| **3 — Intelligence Layer**         | AI Gateway · RAG · semantic · agents   | **Only after Phase 1–2**        |

Phase 1 is the authorised opening focus. AI is explicitly **not** the first deliverable.

---

## Delivery method

Same immutable Delivery Standard, applied to **engines** (not product redesign):

1. Assess the platform
2. Derive the finite engine inventory
3. Owner Accept
4. Engineer one engine slice at a time
5. Certify · Release · Learn · Close

---

## Authoritative faces

| Face                      | Path                                                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Assessment                | [engineering/APZPE-001-PLATFORM-ENGINE-FOUNDATION-ASSESSMENT.md](./engineering/APZPE-001-PLATFORM-ENGINE-FOUNDATION-ASSESSMENT.md) |
| Finite inventory          | [engineering/APZPE-002-FINITE-ENGINE-INVENTORY.md](./engineering/APZPE-002-FINITE-ENGINE-INVENTORY.md)                             |
| Original portfolio freeze | [../portfolio-completion/PORT-005-PORTFOLIO-FREEZE-NOTICE.md](../portfolio-completion/PORT-005-PORTFOLIO-FREEZE-NOTICE.md)         |
