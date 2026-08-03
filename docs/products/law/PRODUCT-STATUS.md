# APZ Law Platform — Product Status (Authoritative)

| Field           | Value                                      |
| --------------- | ------------------------------------------ |
| Document        | **PRODUCT-STATUS**                         |
| Product         | **APZ Law Platform**                       |
| Authority       | Product Board — **STANDING**               |
| Rule            | **Read this document before any Law work** |
| Last updated    | 20260803T135126Z                           |
| Established by  | **APZHUB-LAW-ADOPT-002**                   |
| Governance cert | **PBR-APZHUB-LAW-002 CERTIFIED**           |
| Eng alignment   | **APZHUB-LAW-ADOPT-003 COMPLETE**          |
| Eng cert        | **PBR-APZHUB-LAW-003 CERTIFIED**           |
| Ops alignment   | **APZHUB-LAW-ADOPT-004 COMPLETE**          |

---

## Final Standing Resolution

```text
APZ Law Platform

Product version (packaged):
1.0.0

Historical packaging certification:
PRODUCTION_READY_WITH_LIMITATIONS
APZ-LAW-002 ACCEPTED / CLOSED

Enterprise adoption:
IN PROGRESS — Governance **CERTIFIED**; Engineering **CERTIFIED**;
Operations Alignment **COMPLETE** (await PBR-004)

Enterprise maturity (ADOPT-001):
Level 3 — Certified Product (historical packaging)
PARTIALLY READY for enterprise adoption

Engineering authority:
CLOSED

Product Board:
STANDING

Next authorised programme:
PBR-APZHUB-LAW-004 (Operations Certification) — not started

APZQEP relationship:
APZQEP is Enterprise Reference Implementation — not this product
```

---

## Product identity

| Item                         | Value                                                                                                                                                                                                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User-facing name             | APZ Law Platform                                                                                                                                                                                                                                                             |
| Portfolio id                 | `law`                                                                                                                                                                                                                                                                        |
| App                          | `apps/law-platform` **1.0.0**                                                                                                                                                                                                                                                |
| Core package                 | `@apzhub/legal-business-core` **1.0.0**                                                                                                                                                                                                                                      |
| Search package               | `@apzhub/search-law` **0.1.0** (disclosed residual)                                                                                                                                                                                                                          |
| Authoritative status         | **This document**                                                                                                                                                                                                                                                            |
| Definition pack (historical) | [README.md](./README.md)                                                                                                                                                                                                                                                     |
| Commercial / packaging pack  | [../apz-law/](../apz-law/README.md)                                                                                                                                                                                                                                          |
| Release evidence             | [../../releases/law/1.0.0/](../../releases/law/1.0.0/README.md)                                                                                                                                                                                                              |
| Ops pack                     | [../../engineering/APZHUB-LAW-ADOPT-004/](../../engineering/APZHUB-LAW-ADOPT-004/)                                                                                                                                                                                           |
| Adoption programmes          | [ADOPT-001](../../engineering/APZHUB-LAW-ADOPT-001/) · [ADOPT-002](../../engineering/APZHUB-LAW-ADOPT-002/) · [ADOPT-003](../../engineering/APZHUB-LAW-ADOPT-003/) · [ADOPT-004](../../engineering/APZHUB-LAW-ADOPT-004/) · [PBR-003](../../engineering/PBR-APZHUB-LAW-003/) |

---

## Terminology resolution (LAW-ADOPT-002)

| Prior conflicting label            | Authoritative meaning                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| Definition pack “In Development”   | **Superseded** for posture — historical definition-pack maturity only          |
| releases/law “Awaiting Acceptance” | **Superseded** — APZ-LAW-002 **ACCEPTED / CLOSED** per 1.0.0 acceptance report |
| Production ACCEPTED / PRWL         | **Valid** for historical packaging certification under prior PDS path          |
| Enterprise adoption complete       | **Not claimed** — adoption in progress under ENG-003 lifecycle                 |

---

## Governance baseline (cited, not modified)

| Baseline                 | Citation                                                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Governance 1.0 STABLE    | [APZHUB-ENGINEERING-GOVERNANCE.md](../../engineering/APZHUB-ENGINEERING-GOVERNANCE.md)                                                                    |
| Enterprise Baseline 1.2  | [APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md](../../engineering/APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md)                                                  |
| ES-001 Testing           | [APZHUB-TESTING-STANDARD.md](../../engineering/APZHUB-TESTING-STANDARD.md)                                                                                |
| ES-002 Certification     | [APZHUB-CERTIFICATION-STANDARD.md](../../engineering/APZHUB-CERTIFICATION-STANDARD.md)                                                                    |
| ES-003 Specification     | [APZHUB-ENGINEERING-SPECIFICATION-TEMPLATE.md](../../engineering/APZHUB-ENGINEERING-SPECIFICATION-TEMPLATE.md)                                            |
| Operations Governance    | [APZHUB-OPERATIONS-GOVERNANCE.md](../../engineering/APZHUB-ENG-003/APZHUB-OPERATIONS-GOVERNANCE.md)                                                       |
| Enterprise lifecycle     | [ENG-003](../../engineering/APZHUB-ENG-003/) · [Adoption lifecycle FROZEN](../../engineering/PBR-APZHUB-LAW-001/ENTERPRISE-ADOPTION-LIFECYCLE-REFINED.md) |
| Reference implementation | [APZQEP PRODUCT-STATUS](../apzqep/PRODUCT-STATUS.md)                                                                                                      |

---

## Adoption phase (current)

| Phase      | ID                   | Status                   |
| ---------- | -------------------- | ------------------------ |
| ADOPT-001  | APZHUB-LAW-ADOPT-001 | COMPLETE                 |
| PBR-001    | PBR-APZHUB-LAW-001   | COMPLETE — APPROVED      |
| ADOPT-002  | APZHUB-LAW-ADOPT-002 | **COMPLETE**             |
| PBR-002    | PBR-APZHUB-LAW-002   | **COMPLETE — CERTIFIED** |
| ADOPT-003  | APZHUB-LAW-ADOPT-003 | **COMPLETE**             |
| PBR-003    | PBR-APZHUB-LAW-003   | **COMPLETE — CERTIFIED** |
| ADOPT-004  | APZHUB-LAW-ADOPT-004 | **COMPLETE**             |
| PBR-004    | PBR-APZHUB-LAW-004   | **NEXT** — not started   |
| ADOPT-005+ | Readiness / later    | **NOT AUTHORISED**       |

---

## Governance principles

1. Engineering starts only after formal Owner authorisation.
2. This PRODUCT-STATUS wins over conversation memory and conflicting historical banners.
3. Do not modify enterprise standards in product programmes.
4. Enterprise Adoption Lifecycle is **FROZEN** — do not invent new phases without a governance programme.
5. Do not fabricate operational metrics — use **Defined – Awaiting Production Measurement**.
