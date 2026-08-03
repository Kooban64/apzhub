# APZ Law Platform — Product Status (Authoritative)

| Field           | Value                                      |
| --------------- | ------------------------------------------ |
| Document        | **PRODUCT-STATUS**                         |
| Product         | **APZ Law Platform**                       |
| Authority       | Product Board — **STANDING**               |
| Rule            | **Read this document before any Law work** |
| Last updated    | 20260803T123550Z                           |
| Established by  | **APZHUB-LAW-ADOPT-002**                   |
| Governance cert | **PBR-APZHUB-LAW-002 CERTIFIED**           |

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
IN PROGRESS — Governance **CERTIFIED** (PBR-APZHUB-LAW-002)

Enterprise maturity (ADOPT-001):
Level 3 — Certified Product (historical packaging)
PARTIALLY READY for enterprise adoption

Engineering authority:
CLOSED — LAW-ADOPT-003 authorised to open; execution not started

Product Board:
STANDING

Next authorised programme:
APZHUB-LAW-ADOPT-003 (Enterprise Engineering Alignment) — await Owner Auth execution

APZQEP relationship:
APZQEP is Enterprise Reference Implementation — not this product
```

---

## Product identity

| Item                         | Value                                                                                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User-facing name             | APZ Law Platform                                                                                                                                                        |
| Portfolio id                 | `law`                                                                                                                                                                   |
| App                          | `apps/law-platform` **1.0.0**                                                                                                                                           |
| Core package                 | `@apzhub/legal-business-core` **1.0.0**                                                                                                                                 |
| Search package               | `@apzhub/search-law` **0.1.0** (disclosed residual)                                                                                                                     |
| Authoritative status         | **This document**                                                                                                                                                       |
| Definition pack (historical) | [README.md](./README.md)                                                                                                                                                |
| Commercial / packaging pack  | [../apz-law/](../apz-law/README.md)                                                                                                                                     |
| Release evidence             | [../../releases/law/1.0.0/](../../releases/law/1.0.0/README.md)                                                                                                         |
| Adoption programmes          | [../../engineering/APZHUB-LAW-ADOPT-001/](../../engineering/APZHUB-LAW-ADOPT-001/) · [../../engineering/APZHUB-LAW-ADOPT-002/](../../engineering/APZHUB-LAW-ADOPT-002/) |

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
| Enterprise lifecycle     | [ENG-003](../../engineering/APZHUB-ENG-003/) · [Adoption lifecycle FROZEN](../../engineering/PBR-APZHUB-LAW-001/ENTERPRISE-ADOPTION-LIFECYCLE-REFINED.md) |
| Reference implementation | [APZQEP PRODUCT-STATUS](../apzqep/PRODUCT-STATUS.md)                                                                                                      |

---

## Adoption phase (current)

| Phase      | ID                            | Status                                       |
| ---------- | ----------------------------- | -------------------------------------------- |
| ADOPT-001  | APZHUB-LAW-ADOPT-001          | COMPLETE                                     |
| PBR-001    | PBR-APZHUB-LAW-001            | COMPLETE — APPROVED                          |
| ADOPT-002  | APZHUB-LAW-ADOPT-002          | **IN EXECUTION / COMPLETE (this programme)** |
| PBR-002    | PBR-APZHUB-LAW-002            | **NEXT** — not started                       |
| ADOPT-003+ | Engineering / Ops / Readiness | **NOT AUTHORISED**                           |

---

## Governance principles

1. Engineering starts only after formal Owner authorisation (and after PBR-002 for eng alignment).
2. This PRODUCT-STATUS wins over conversation memory and conflicting historical banners.
3. Do not modify enterprise standards in product programmes.
4. Enterprise Adoption Lifecycle is **FROZEN** — do not invent new phases without a governance programme.
