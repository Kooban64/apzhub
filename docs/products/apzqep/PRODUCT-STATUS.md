# APZQEP — Product Status (Authoritative)

| Field              | Value                                           |
| ------------------ | ----------------------------------------------- |
| Document           | **PRODUCT-STATUS**                              |
| Authority          | Product Board — **STANDING**                    |
| Audience           | Engineers, architects, auditors, AI assistants  |
| Rule               | **Read this document before any APZQEP work**   |
| Last updated       | 20260803T175516Z                                |
| Engineering thread | **FORMALLY COMPLETE** (V1.0)                    |
| Product posture    | **GENERAL AVAILABILITY**                        |
| Management posture | **Operations-led** (APZQEP-OPS-001)             |
| V1.1 definition    | **APZQEP-160 APPROVED** (PBR-APZQEP-160)        |
| V1.1 Wave 1        | **CERTIFIED** (PBR-APZQEP-161)                  |
| V1.1 Wave 2        | **CERTIFIED** (PBR-APZQEP-162)                  |
| V1.1 Wave 3 arch   | **APZQEP-163-000 COMPLETE** (architecture only) |

---

## Final Standing Resolution

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

Enterprise Engineering Standards:
COMPLETE

Platform Foundation:
COMPLETE

Core Quality Engineering:
COMPLETE

Durable Persistence:
COMPLETE

Production Security:
COMPLETE

Product Readiness Audit (APZQEP-150):
PASSED (historical — NO-GO while RB-001/RB-002 open) — IMMUTABLE

Product Readiness Re-certification (APZQEP-150R):
COMPLETE — PASS — GO RECOMMENDED

Product Board Resolution (PBR-APZQEP-1.0-001):
COMPLETE — GO

Release Blockers:
NONE

RB-001:
FORMALLY CLEARED / CLOSED (APZQEP-151 CERTIFIED)

RB-002:
FORMALLY CLEARED / CLOSED (APZQEP-152 CERTIFIED)

Production Release:
AUTHORISED — General Production Release

Production Certification:
COMPLETE

Availability:
GENERAL AVAILABILITY

Current Engineering Authority:
CLOSED

Current Product Board Authority:
STANDING

Operational Programme (APZQEP-OPS-001):
COMPLETE — GA operations & product intelligence established

Management posture:
OPERATIONS-LED

Next Authorised Programme:
Await Product Board approval of APZQEP-163-000 architecture.
APZQEP-163 engineering AUTHORISED TO OPEN only after Board + separate Owner Auth — NOT STARTED.
APZQEP-164…166 NOT AUTHORISED

Version 1.1 definition programme:
APZQEP-160 COMPLETE — Product Board **APPROVED** (PBR-APZQEP-160)

Version 1.1 Wave 1:
APZQEP-161 COMPLETE · APZQEP-161R COMPLETE · **PBR-APZQEP-161 CERTIFIED**
APZQEP-161-OE COMPLETE — internal adoption / dogfooding (LIMITED eng)
Platform package: @apzhub/platform-automation 0.1.0 (Playwright first provider; engine provider-neutral)

Version 1.1 Wave 2:
APZQEP-162 COMPLETE — Enterprise Source Control Integration Platform
Platform package: @apzhub/platform-scm 0.1.0 (GitHub first provider; engine provider-neutral)
Board certification: **CERTIFIED** (PBR-APZQEP-162) · eng commit `9fb22b0ee661cce9b9f8da4c825769d043faa691`
Durability: process-local SCM store — not production-durable until persistence certified

Version 1.1 Wave 3:
APZQEP-163-000 COMPLETE — Enterprise Quality Intelligence Platform Architecture (docs only)
Title: Enterprise Quality Intelligence Platform (AI is a provider, not the platform)
Intended package: @apzhub/platform-quality-intelligence
APZQEP-163 engineering: NOT STARTED — await Board approval + Owner Auth

Version 1.1 Wave 4+:
APZQEP-164…166 NOT AUTHORISED

Next Action:
Product Board review/approve APZQEP-163-000.
Do NOT begin APZQEP-163 engineering without Board approval + Owner Auth.
Ops: push local main to origin when remote credentials available.
```

---

## Product identity

| Item                  | Value                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| Product               | **APZQEP** — Enterprise Quality Engineering Platform                                                 |
| Product version       | **1.0**                                                                                              |
| Working platform name | APZHUB                                                                                               |
| Posture               | **GENERAL AVAILABILITY**                                                                             |
| Board resolution      | [v1.1/pbr-apzqep-1.0-001/](./v1.1/pbr-apzqep-1.0-001/)                                               |
| Operations programme  | [v1.1/apzqep-ops-001/](./v1.1/apzqep-ops-001/) — **COMPLETE**                                        |
| Declaration           | [v1.1/APZQEP-VERSION-1.0-ENGINEERING-COMPLETE.md](./v1.1/APZQEP-VERSION-1.0-ENGINEERING-COMPLETE.md) |

---

## Governance & baseline

| Item                            | Value                                                               |
| ------------------------------- | ------------------------------------------------------------------- |
| Governance version              | **1.0 STABLE**                                                      |
| Enterprise Engineering Baseline | **1.x STABLE (1.2)**                                                |
| Enterprise Standards            | ES-001, ES-002, ES-003 **IN FORCE**                                 |
| ES-004                          | **NOT AUTHORISED**                                                  |
| Operating mode                  | Evolve the Enterprise · **operations-led**                          |
| Product Board authority         | **STANDING**                                                        |
| Engineering authority           | **CLOSED**                                                          |
| Version 1.1                     | Definition **APPROVED**; Wave 1 **CERTIFIED**; Wave 2 **CERTIFIED** |
| V1.1 definition pack            | [v1.1/apzqep-160/](./v1.1/apzqep-160/)                              |
| V1.1 Board approval             | [v1.1/pbr-apzqep-160/](./v1.1/pbr-apzqep-160/)                      |
| V1.1 Wave 1 certification       | [v1.1/pbr-apzqep-161/](./v1.1/pbr-apzqep-161/)                      |
| V1.1 Wave 2 certification       | [v1.1/pbr-apzqep-162/](./v1.1/pbr-apzqep-162/)                      |
| V1.1 Wave progress              | [v1.1/WAVE-PROGRESS-REGISTER.md](./v1.1/WAVE-PROGRESS-REGISTER.md)  |
| V1.1 Wave 1 eng pack            | [v1.1/apzqep-161/](./v1.1/apzqep-161/)                              |
| V1.1 Wave 1 readiness pack      | [v1.1/apzqep-161r/](./v1.1/apzqep-161r/)                            |
| V1.1 Wave 2 eng pack            | [v1.1/apzqep-162/](./v1.1/apzqep-162/)                              |
| Product Board Register          | [PRODUCT-BOARD-REGISTER.md](./PRODUCT-BOARD-REGISTER.md)            |

---

## Programme History (Version 1.0)

| Programme              | Outcome                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| APZQEP-120             | Platform Foundation Complete                                              |
| APZQEP-140             | Core Quality Engineering Complete                                         |
| APZQEP-150             | Product Readiness Audit Complete (**NO-GO** — historical / immutable)     |
| APZQEP-151             | Durable Product Persistence **CERTIFIED / CLOSED** (RB-001)               |
| APZQEP-152             | Enterprise Production RBAC & Security **CERTIFIED / CLOSED** (RB-002)     |
| APZQEP-150R            | Product Readiness Re-certification **COMPLETE** — **GO recommended**      |
| **PBR-APZQEP-1.0-001** | Product Board **GO** — General Production Release **AUTHORISED**          |
| **APZQEP-OPS-001**     | GA Operations & Product Intelligence **COMPLETE** (non-engineering)       |
| **APZQEP-160**         | Enterprise Quality Platform Definition & Roadmap **COMPLETE**             |
| **PBR-APZQEP-160**     | V1.1 Definition **APPROVED** — Wave 1 (**APZQEP-161**) authorised to open |
| **APZQEP-161**         | Enterprise Automation Foundation **COMPLETE**                             |
| **APZQEP-161R**        | Wave 1 Operational Readiness & Usability **COMPLETE**                     |
| **PBR-APZQEP-161**     | Wave 1 **CERTIFIED** — APZQEP-162 **AUTHORISED**                          |
| **APZQEP-161-OE**      | Operational Enablement & Internal Adoption **COMPLETE**                   |
| **APZQEP-162**         | Enterprise Source Control Integration Platform **COMPLETE**               |
| **PBR-APZQEP-162**     | Wave 2 **CERTIFIED** — APZQEP-163 **AUTHORISED TO OPEN** (gated)          |
| **APZQEP-163-000**     | Enterprise Quality Intelligence Platform Architecture **COMPLETE**        |

---

## Active capabilities (Core QE)

| Cap | Title                                 | Package                                                        | Status   | Persistence / Security     |
| --- | ------------------------------------- | -------------------------------------------------------------- | -------- | -------------------------- |
| A–F | Core Quality Engineering capabilities | `@apzhub/qep-*` **0.1.0** (promotion authorised, not executed) | COMPLETE | Postgres SoR · fail-closed |

---

## Certified / closed programmes

| Programme          | Status                                                  |
| ------------------ | ------------------------------------------------------- |
| APZQEP-120         | **CERTIFIED / CLOSED**                                  |
| APZQEP-140         | **CERTIFIED / CLOSED**                                  |
| APZQEP-150         | **CERTIFIED** — historical production **NO-GO**         |
| APZQEP-151         | **CERTIFIED / CLOSED** — RB-001 **CLEARED**             |
| APZQEP-152         | **CERTIFIED / CLOSED** — RB-002 **CLEARED**             |
| APZQEP-150R        | **COMPLETE** — audit **PASS** — **GO recommended**      |
| PBR-APZQEP-1.0-001 | **COMPLETE** — Product Board **GO** — **GA AUTHORISED** |
| APZQEP-OPS-001     | **COMPLETE** — operations-led GA governance established |

Board / audit / ops:

- [apzqep-151/APZQEP-151-PRODUCT-BOARD-CERTIFICATION.md](./v1.1/apzqep-151/APZQEP-151-PRODUCT-BOARD-CERTIFICATION.md)
- [apzqep-152/APZQEP-152-PRODUCT-BOARD-CERTIFICATION.md](./v1.1/apzqep-152/APZQEP-152-PRODUCT-BOARD-CERTIFICATION.md)
- [apzqep-150r/GO-NO-GO-REPORT.md](./v1.1/apzqep-150r/GO-NO-GO-REPORT.md)
- [pbr-apzqep-1.0-001/PRODUCT-BOARD-RELEASE-DECISION.md](./v1.1/pbr-apzqep-1.0-001/PRODUCT-BOARD-RELEASE-DECISION.md)
- [apzqep-ops-001/OPS-001-COMPLETION.md](./v1.1/apzqep-ops-001/OPS-001-COMPLETION.md)

---

## Release blockers

| ID         | Status               |
| ---------- | -------------------- |
| **RB-001** | **CLEARED / CLOSED** |
| **RB-002** | **CLEARED / CLOSED** |
| New        | **NONE**             |

---

## Production readiness state

| Item                    | State                                                                |
| ----------------------- | -------------------------------------------------------------------- |
| APZQEP-150 (historical) | NO-GO recorded (immutable)                                           |
| APZQEP-150R             | GO recommended                                                       |
| PBR-APZQEP-1.0-001      | **GO** — General Production Release                                  |
| Release blockers        | **NONE**                                                             |
| Release authority       | **AUTHORISED**                                                       |
| Deployment authority    | **AUTHORISED** (operational procedures)                              |
| Package promotion       | **AUTHORISED** (release governance; Caps still 0.1.0 until executed) |
| Feature freeze          | **ACTIVE** (engineering CLOSED)                                      |

---

## Accepted residuals (not release blockers)

1. Shell Cap navigation visibility prior to API denial (UX).
2. Project membership attribute refinement.
3. Capability package versions remain 0.1.0 until promotion execution.
4. Historical APZQEP-150 retained unchanged.
5. Capability-specific accessibility coverage to evolve over future releases.

---

## Path remaining

1. Operate Version 1.0 under APZQEP-OPS-001.
2. Product Board approve APZQEP-163-000 architecture.
3. Open APZQEP-163 engineering only with separate Owner Auth; do not authorise 164–166 yet.

---

## Thread Closure

Version 1.0 engineering lifecycle is formally complete. Product Board authorised GA. Operational governance (APZQEP-OPS-001) is established. Management is **operations-led**.

Authoritative state:

> **APZQEP Version 1.0 — GENERAL AVAILABILITY. Operations-led. V1.0 engineering CLOSED. APZQEP-OPS-001 COMPLETE. Waves 1–2 CERTIFIED. APZQEP-163-000 Architecture COMPLETE. APZQEP-163 engineering NOT STARTED. Waves 164–166 NOT AUTHORISED.**

---

## Governance principles (still in force)

1. Engineering starts only after formal Owner authorisation.
2. Release readiness remains independent of engineering.
3. Historical APZQEP-150 NO-GO remains immutable.
4. APZQEP-150R recommended GO; Product Board alone authorises release (recorded in PBR-APZQEP-1.0-001).
5. Do not reopen APZQEP-120 / 140 / 150 / 151 / 152 / 150R / PBR-APZQEP-1.0-001.
6. Do not open Version 1.1 without sufficient operational evidence and Product Board authorisation.
7. From APZQEP-OPS-001: product evolution is **operations-led** — Board priorities from production data, feedback, and support trends.
