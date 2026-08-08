# APS-003 — Platform Service Engineering

| Field          | Value                                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| Document       | **APS-003**                                                                         |
| Status         | **IN PROGRESS** — Stages 1–4 largely complete · RC1 awaited                         |
| Timestamp      | 20260808T233500Z                                                                    |
| Inventory      | [APS-002](./APS-002-FINITE-PLATFORM-SERVICE-INVENTORY.md) **ACCEPTED · FROZEN (7)** |
| Philosophy     | [OWNER-ACK-APS-003-PHILOSOPHY.md](./OWNER-ACK-APS-003-PHILOSOPHY.md)                |
| Owner Decision | [OWNER-DECISION-APS-002.md](./OWNER-DECISION-APS-002.md)                            |
| Target         | **Platform Services Foundation v1.0**                                               |

---

## Philosophy

> We are not building services. We are proving that the services deserve to exist.

Per slice: correctly owned · bounded · consumed · production ready? → certify or rationalise (not rewrite).

---

## Stages

| Stage           | Focus                                             | Status |
| --------------- | ------------------------------------------------- | ------ |
| 1 Visibility    | Catalogue · docs                                  | ✅     |
| 2 Ownership     | QEP Notify/Command · single-consumer · boundaries | ✅     |
| 3 Consolidation | Personalisation · contracts                       | ✅     |
| 4 Hardening     | Tests · certification packs                       | ✅     |
| 5 Release       | RC1 · PR · Operational Learning                   | ⏳     |

---

## Finite engineering closeout inventory

| ID           | Slice                               | Status                                                                                                                    |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **APS-E-01** | Service catalogue honesty face      | **COMPLETE**                                                                                                              |
| **APS-E-02** | Certification packs (7)             | **COMPLETE** → [certification/](./certification/)                                                                         |
| **APS-E-03** | Ownership hygiene — Notifications   | **COMPLETE** → [engineering/APS-E-03-OWNERSHIP-NOTIFICATIONS.md](./engineering/APS-E-03-OWNERSHIP-NOTIFICATIONS.md)       |
| **APS-E-04** | Ownership hygiene — Command         | **COMPLETE** → [engineering/APS-E-04-OWNERSHIP-COMMAND.md](./engineering/APS-E-04-OWNERSHIP-COMMAND.md)                   |
| **APS-E-05** | Reclassify single-consumer packages | **COMPLETE** → [engineering/APS-E-05-RECLASSIFY-SINGLE-CONSUMER.md](./engineering/APS-E-05-RECLASSIFY-SINGLE-CONSUMER.md) |
| **APS-E-06** | Personalisation consolidate         | **COMPLETE** → [engineering/APS-E-06-PERSONALISATION.md](./engineering/APS-E-06-PERSONALISATION.md)                       |
| **APS-E-07** | Hardening / Playwright              | **COMPLETE** → `testing/playwright/e2e/apz-platform-services-foundation-hardening.spec.ts`                                |
| **APS-E-08** | RC1 / Release pack                  | **READY FOR OWNER APPROVE**                                                                                               |

---

## RC1 architecture proof (Owner)

1. Clear owner per Platform Service
2. Two-Consumer Rule or constitutional definition
3. Backwards compatible products
4. No product logic in platform
5. No platform logic leaked into products as alternate platform services

Candidate Law 7 (not ratified): one canonical contract per Platform Service — watch evidence in ownership docs.

---

## Hard constraints

No additional services · no product redesign · no Foundation breakage · no AI · no constitutional drift · releasable repo
