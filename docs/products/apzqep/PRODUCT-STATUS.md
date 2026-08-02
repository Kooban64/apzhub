# APZQEP — Product Status (Authoritative)

| Field        | Value                                          |
| ------------ | ---------------------------------------------- |
| Document     | **PRODUCT-STATUS**                             |
| Authority    | Product Board                                  |
| Audience     | Engineers, architects, auditors, AI assistants |
| Rule         | **Read this document before any APZQEP work**  |
| Last updated | 20260802T192900Z                               |

---

## Standing Product Board resolution

```text
APZQEP Version 1.0

Engineering:
COMPLETE

Product:
COMPLETE

Architecture:
COMPLETE

Governance:
COMPLETE

Enterprise Standards:
COMPLETE

Platform Foundation:
COMPLETE

Core Quality Engineering:
COMPLETE

Product Readiness Audit:
PASSED

Production Release:
NO-GO

Reason:
Outstanding Release Blockers

RB-001
Durable Product Persistence

RB-002
Production RBAC Hardening

Production Certification:
PENDING
```

---

## Product identity

| Item                  | Value                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| Product               | **APZQEP** — Enterprise Quality Engineering Platform                                                 |
| Product version       | **1.0**                                                                                              |
| Working platform name | APZHUB                                                                                               |
| Posture               | **LIMITED_AVAILABILITY** until RB-001 and RB-002 cleared                                             |
| Declaration           | [v1.1/APZQEP-VERSION-1.0-ENGINEERING-COMPLETE.md](./v1.1/APZQEP-VERSION-1.0-ENGINEERING-COMPLETE.md) |

---

## Governance & baseline

| Item                            | Value                               |
| ------------------------------- | ----------------------------------- |
| Governance version              | **1.0 STABLE**                      |
| Enterprise Engineering Baseline | **1.x STABLE (1.2)**                |
| Enterprise Standards            | ES-001, ES-002, ES-003 **IN FORCE** |
| ES-004                          | **NOT AUTHORISED**                  |
| Operating mode                  | Evolve the Enterprise               |
| APZQEP-ENG-001                  | **ARCHIVED** (reference only)       |
| APZHUB-ENG-002 Phase 1          | **CLOSED**                          |

---

## Active capabilities (Core QE)

| Cap | Title                                  | Programme    | Package                                       | Status               |
| --- | -------------------------------------- | ------------ | --------------------------------------------- | -------------------- |
| A   | Enterprise Test Suite Management       | APZQEP-140-A | `@apzhub/qep-suites` 0.1.0                    | COMPLETE             |
| B   | Enterprise Test Execution Planning     | APZQEP-140-B | `@apzhub/qep-execution-plans` 0.1.0           | COMPLETE             |
| C   | Enterprise Test Execution Workspace    | APZQEP-140-C | `@apzhub/qep-execution-workspace` 0.1.0       | COMPLETE             |
| D   | Enterprise Defect Management           | APZQEP-140-D | `@apzhub/qep-defects` 0.1.0                   | COMPLETE             |
| E   | Enterprise Requirements & Traceability | APZQEP-140-E | `@apzhub/qep-requirements-traceability` 0.1.0 | COMPLETE             |
| F   | Enterprise Reporting & Analytics       | APZQEP-140-F | `@apzhub/qep-reporting` 0.1.0                 | COMPLETE / CERTIFIED |

Progress: [v1.1/apzqep-140/CAPABILITY-PROGRESS.md](./v1.1/apzqep-140/CAPABILITY-PROGRESS.md)

---

## Certified / closed programmes

| Programme      | Title                                        | Status                                                         |
| -------------- | -------------------------------------------- | -------------------------------------------------------------- |
| APZQEP-110     | Product planning                             | APPROVED                                                       |
| APZQEP-111     | Solution architecture                        | APPROVED                                                       |
| APZQEP-120     | Platform Foundation                          | **CERTIFIED / CLOSED**                                         |
| APZQEP-140-000 | Core QE Architecture                         | **CERTIFIED**                                                  |
| APZQEP-140     | Core Quality Engineering (A–F)               | **CERTIFIED / CLOSED**                                         |
| APZQEP-150     | Product Readiness & Production Certification | **CERTIFIED** — audit **PASSED**; production release **NO-GO** |

Board: [v1.1/apzqep-150/APZQEP-150-PRODUCT-BOARD-CERTIFICATION.md](./v1.1/apzqep-150/APZQEP-150-PRODUCT-BOARD-CERTIFICATION.md)

---

## Deferred / not next programmes

| Programme                                         | Title                                 | Status                                           |
| ------------------------------------------------- | ------------------------------------- | ------------------------------------------------ |
| APZQEP-151                                        | Durable Product Persistence           | **RECOMMENDED · NOT AUTHORISED** (clears RB-001) |
| APZQEP-152                                        | Production RBAC Hardening             | **RECOMMENDED · NOT AUTHORISED** (clears RB-002) |
| Former “AI Native” under band 150                 | AI / QI                               | **Deferred**                                     |
| APZQEP-160                                        | Portfolio Intelligence                | **NOT NEXT** — no justification after 150        |
| APZQEP-170 / 180                                  | Integrations / Operational Excellence | Future bands — not next                          |
| Cloud storage, notify adapters, ALM, CI, calendar | Enhancements                          | **Deferred**                                     |

---

## Release blockers

| ID         | Title                                                 | Clears via                   |
| ---------- | ----------------------------------------------------- | ---------------------------- |
| **RB-001** | Durable Product Persistence (Caps A–F IN-MEMORY SoR)  | APZQEP-151 (when authorised) |
| **RB-002** | Production RBAC Hardening (HTTP permission elevation) | APZQEP-152 (when authorised) |

Register: [v1.1/apzqep-150/ISSUES-REGISTER.md](./v1.1/apzqep-150/ISSUES-REGISTER.md)

---

## Known limitations

Authoritative list: [v1.1/apzqep-150/KNOWN-LIMITATIONS.md](./v1.1/apzqep-150/KNOWN-LIMITATIONS.md)

Primary: Caps A–F process-local IN-MEMORY SoR; LIMITED_AVAILABILITY HTTP permission elevation; Cap F system-reporting actor; dual ENG vs Core QE surfaces.

---

## Production readiness state

| Item                                 | State                                         |
| ------------------------------------ | --------------------------------------------- |
| Product readiness audit (APZQEP-150) | **PASSED / CERTIFIED**                        |
| Unrestricted enterprise production   | **NO-GO**                                     |
| Production certification             | **PENDING**                                   |
| Release authority                    | **NOT AUTHORISED**                            |
| Deployment authority                 | **NOT AUTHORISED**                            |
| Feature freeze                       | **ACTIVE** until Owner authorises a programme |

---

## Current Product Board decision

Programme APZQEP-150 is **CERTIFIED**. Production release is **NO-GO** because of outstanding release blockers RB-001 and RB-002.

Dual outcome: the **programme** passed; the **product** (unrestricted production) did not.

---

## Next authorised programme

```text
NONE
```

Engineering for APZQEP-151 or APZQEP-152 **SHALL NOT** begin until an explicit Owner Authorisation Pack is issued for **one** programme.

Recommended sequence (not authorised):

1. **APZQEP-151** — Durable Product Persistence (preferred — affects Caps A–F)
2. **APZQEP-152** — Production RBAC Hardening
3. Re-run **APZQEP-150** readiness audit

---

## Governance principles (still in force)

1. Engineering starts only after formal Owner authorisation.
2. Product Board decisions are recorded before engineering begins.
3. Release readiness remains independent of engineering (audit must not quietly become the fix).
4. One authorised programme at a time.
5. Do not reopen APZQEP-120 or APZQEP-140.
6. Do not open APZQEP-160 as the next step.

---

## Document map (start here)

| Need                              | Path                                                                   |
| --------------------------------- | ---------------------------------------------------------------------- |
| **This status**                   | `docs/products/apzqep/PRODUCT-STATUS.md`                               |
| Version 1.0 declaration           | `docs/products/apzqep/v1.1/APZQEP-VERSION-1.0-ENGINEERING-COMPLETE.md` |
| Planning / architecture hub       | `docs/products/apzqep/v1.1/README.md`                                  |
| Programme bands                   | `docs/products/apzqep/v1.1/ENGINEERING-PROGRAMMES.md`                  |
| Platform ops coexistence          | `ENVIRONMENT.md`                                                       |
| Current milestone (platform-wide) | `docs/foundation/CURRENT-MILESTONE.md`                                 |
