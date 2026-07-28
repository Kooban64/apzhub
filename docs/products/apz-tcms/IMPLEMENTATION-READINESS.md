# APZ TCMS — Implementation Readiness (Release 1.0)

> **Programme:** APZ-TCMS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Evidence:** AI-MANIFEST · disk · APZTCMS-001…024 · ADR-0059 · Platform Delivery Standard

---

## Delivery path

# Existing Platform → Commercial Packaging

See [DELIVERY-PATH.md](./DELIVERY-PATH.md).

---

## Overall maturity

| Plane                           | Maturity                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------- |
| Platform APZ TCMS (engineering) | **Production-class slices** (PRWL where certified) · programmes 001…024 complete |
| Commercial product Release 1.0  | **Planning** (this pack) → ready for **packaging/certification** programme       |

---

## Final recommendation

# READY WITH CONDITIONS

| Option                    | Selected?                                                             |
| ------------------------- | --------------------------------------------------------------------- |
| NOT READY                 | No — planning complete; platform vertical exists                      |
| **READY WITH CONDITIONS** | **Yes**                                                               |
| IMPLEMENTATION READY      | **No** — commercial SemVer packaging programme not yet Owner-accepted |

**Meaning:** Owner may accept this planning programme and authorise a **named packaging/certification programme** (e.g. APZ-TCMS-002) for commercial SemVer **1.0.0**. Owner must **not** treat this pack as authorisation to implement Kiwi, GitLab CI, AI Assist, or rebuild the TCMS platform.

---

## Dimension assessment

| Dimension                   | Status                        | Evidence                                        |
| --------------------------- | ----------------------------- | ----------------------------------------------- |
| Platform maturity           | **PASS** (native)             | APZTCMS-001…024 · testing-* **0.11.0**          |
| Architecture readiness      | **PASS**                      | ADR-0059 · architecture corpus · freezes held   |
| Integration readiness       | **PASS** (GHA) / **N/A** Kiwi | GHA **0.1.0** frozen; Kiwi superseded           |
| Workbench readiness         | **PASS**                      | `components/testing/*` · module `testing`       |
| HTTP / contracts / services | **PASS**                      | `/api/v1/testing/*` · gateway.testing           |
| Documentation readiness     | **PASS** (planning)           | This pack + extensive APZTCMS docs              |
| Commercial readiness        | **PARTIAL**                   | Catalogue/editions exist; SemVer pack absent    |
| Release readiness           | **FAIL**                      | No `docs/releases/tcms/`                        |
| Operational readiness       | **PARTIAL**                   | Platform ops exist; commercial ops pack pending |

---

## Conditions for next programme (packaging)

| #   | Condition                                                             | Current        |
| --- | --------------------------------------------------------------------- | -------------- |
| C1  | Owner Acceptance of APZ-TCMS-001                                      | Pending        |
| C2  | Named Owner Approval for packaging/certification programme            | **FAIL**       |
| C3  | Delivery path locked: Existing Platform → Commercial Packaging        | **Documented** |
| C4  | Kiwi / GitLab / AI remain out of Release 1.0 unless separate Approval | **Documented** |
| C5  | `docs/releases/tcms/1.0.0/` produced by packaging programme           | **FAIL**       |
| C6  | GHA freeze + Integration SDK **1.0.0** freeze held                    | **PASS**       |
| C7  | QA-002 PRODUCTION READY retained                                      | **PASS**       |

---

## What must not be confused with commercial APZ TCMS 1.0

| On disk                                | Not a substitute for                             |
| -------------------------------------- | ------------------------------------------------ |
| APZTCMS-001…024 engineering completion | Commercial SemVer **1.0.0** product release pack |
| GHA vertical PRWL                      | Full multi-CI GA (GitLab absent)                 |
| Kiwi in historical strategy docs       | Native SoR product (ADR-0059)                    |
| Platform Reporting / Analytics         | TCMS product packaging                           |

---

## Implementation rule

Do **not** implement from this pack. Await Owner Acceptance, then separate named Approval for packaging/certification only.
