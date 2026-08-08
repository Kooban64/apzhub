# APS-003 — Platform Service Engineering

| Field          | Value                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| Document       | **APS-003**                                                            |
| Status         | **OPEN** — Engineering Execution authorised                            |
| Timestamp      | 20260808T233000Z                                                       |
| Inventory      | [APS-002](./APS-002-FINITE-PLATFORM-SERVICE-INVENTORY.md) **ACCEPTED** |
| Owner Decision | [OWNER-DECISION-APS-002.md](./OWNER-DECISION-APS-002.md)               |
| Target         | **Platform Services Foundation v1.0**                                  |

---

## Objective

> Certify and rationalise the Platform Service Layer while preserving the immutable Architecture Constitution and maintaining complete backwards compatibility with all Production Ready products.

---

## Finite engineering closeout inventory

| ID           | Slice                               | Scope                                                                      | Status       |
| ------------ | ----------------------------------- | -------------------------------------------------------------------------- | ------------ |
| **APS-E-01** | Service catalogue honesty face      | `GET /api/v1/platform/services` · seven APS rows · excludes AI/machinery   | **COMPLETE** |
| **APS-E-02** | Certification packs                 | Per-service certify docs (contracts, consumers, ownership)                 | Pending      |
| **APS-E-03** | Ownership hygiene — Notifications   | Document + plan align `qep-notification` → APS-Notifications (no UX break) | Pending      |
| **APS-E-04** | Ownership hygiene — Command         | Document + plan align `qep-command` → APS-Command (no UX break)            | Pending      |
| **APS-E-05** | Reclassify single-consumer packages | Record product/QEP ownership for non-inventory `platform-*`                | Pending      |
| **APS-E-06** | Personalisation consolidate         | Clarify prefs/favorites/recent as APS-Personalisation surface              | Pending      |
| **APS-E-07** | Hardening / Playwright              | Smoke that catalogue + existing service APIs remain healthy                | Pending      |
| **APS-E-08** | RC1 / Release pack                  | Platform Services Foundation v1.0                                          | Pending      |

---

## Hard constraints

- No additional Platform Services
- No product redesign / end-user retraining
- No Platform Engine Foundation contract breakage
- No AI / RAG / agents
- No constitutional drift
- Repository remains releasable at all times

---

## Definition of Done (Programme 002)

- Seven APS services listed and certified
- Ownership anomalies addressed or explicitly deferred with Owner note
- Single-consumer packages reclassified
- Hardening tests pass
- Release tag / freeze branch
- Operational Learning opened
- Programme 002 Closed
