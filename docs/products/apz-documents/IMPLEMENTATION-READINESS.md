# APZ Documents — Implementation Readiness (Release 1.0)

> **Programme:** APZ-DOCUMENTS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Evidence:** AI-MANIFEST · disk inventory · APZDOCS-006 · portfolio Definition Pack · Platform Delivery Standard  
> **Prior pack:** [documents/IMPLEMENTATION-READINESS.md](../documents/IMPLEMENTATION-READINESS.md) (PRODUCTS-002)

---

## Overall maturity (after APZ-DOCUMENTS-001)

| Plane                                     | Maturity                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| Platform Documents vertical (engineering) | **Production** (PRWL · architecture frozen) — unchanged                    |
| Commercial product Release 1.0            | **Planning** (this pack) → ready for **certification packaging** programme |

---

## Final recommendation

# READY WITH CONDITIONS

| Option                    | Selected?                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| NOT READY                 | No — planning pack complete; platform vertical certified                                      |
| **READY WITH CONDITIONS** | **Yes**                                                                                       |
| IMPLEMENTATION READY      | **No** — commercial SemVer packaging / product certification programme not yet Owner-accepted |

**Meaning:** Owner may accept this planning programme and authorise a **named packaging/certification programme** (e.g. APZ-DOCUMENTS-002) for commercial SemVer **1.0.0** of the frozen APZDOCS surface. Owner must **not** treat this pack as authorisation to implement Paperless, expand beyond APZDOCS non-goals, or rebuild the Documents Platform.

---

## Dimension assessment

| Dimension                       | Status                                            | Evidence                                                                        |
| ------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Current Product Maturity**    | Platform **Production** · Commercial **Planning** | APZDOCS-006 PRWL; no `docs/releases/documents/1.0.0/`                           |
| **Architecture Readiness**      | **PASS** (frozen)                                 | Document Architecture + Vertical Certification                                  |
| **Integration Readiness**       | **PASS** (native) / **N/A** Paperless             | Native SoR; Paperless absent & excluded                                         |
| **Workbench Readiness**         | **PASS** (platform)                               | `/workspace/documents` certified                                                |
| **HTTP / Contracts / Services** | **PASS**                                          | document-contracts **0.3.0** · core **0.3.0** · HTTP + gateway path             |
| **Platform Readiness**          | **PASS**                                          | Gateway · IAM · SDK **1.0.0** · Search publication                              |
| **Documentation Readiness**     | **PASS** (planning)                               | This Release Pack + portfolio Definition Pack                                   |
| **Commercial Readiness**        | **PARTIAL**                                       | Catalogue/portfolio exist; commercial SemVer not filed                          |
| **Release Readiness**           | **FAIL**                                          | No `docs/releases/documents/`; checklist unexecutable until packaging programme |
| **Operational Readiness**       | **PARTIAL**                                       | Platform ops exist; commercial ops pack pending; binary plane constrained       |

---

## Platform Delivery Standard lifecycle map

| Phase                 | Documents status (repo evidence)                                 |
| --------------------- | ---------------------------------------------------------------- |
| Commercial Planning   | **This programme**                                               |
| Platform Foundation   | **Complete** (historical APZDOCS) — do not re-open without Owner |
| Information Model     | **Complete** (document-contracts domain)                         |
| Provider Integration  | **Native SoR** — Paperless **not** in Release 1.0                |
| Contracts             | **Complete** (`@apzhub/document-contracts` **0.3.0**)            |
| Platform Services     | **Complete** (gateway.documents / document services)             |
| HTTP API              | **Complete** (`/api/v1/documents`)                               |
| Workbench Module      | **Complete** (`/workspace/documents`)                            |
| Product Certification | **Pending** future programme                                     |
| Production Release    | **Pending** SemVer evidence folder                               |

---

## Conditions for next programme (certification packaging)

| #   | Condition                                                                      | Current                  |
| --- | ------------------------------------------------------------------------------ | ------------------------ |
| C1  | Owner Acceptance of APZ-DOCUMENTS-001                                          | Pending                  |
| C2  | Named Owner Approval for commercial certification/packaging programme          | **FAIL**                 |
| C3  | Release 1.0 scope locked to APZDOCS-006 PRWL (metadata-first)                  | **Documented** here      |
| C4  | Paperless / binary DMS features remain excluded unless separate ADR + Approval | **Documented**           |
| C5  | `docs/releases/documents/1.0.0/` evidence pack produced by packaging programme | **FAIL**                 |
| C6  | QA-002 PRODUCTION READY retained; APZDOCS freeze intact                        | **PASS** (held)          |
| C7  | Vertical audits remain green (`pnpm audit:document-vertical` and related)      | **PASS** (baseline held) |

---

## What must not be confused with commercial APZ Documents 1.0

| On disk                                   | Not a substitute for                             |
| ----------------------------------------- | ------------------------------------------------ |
| APZDOCS-006 vertical certification        | Commercial SemVer **1.0.0** product release pack |
| Portfolio pack `docs/products/documents/` | This commercial Release Planning pack            |
| Law Platform document surfaces            | APZ Documents commercial product                 |
| Future Paperless adapter                  | Release 1.0 requirement                          |

---

## Implementation rule

Do **not** implement from this pack. Await Owner Acceptance of APZ-DOCUMENTS-001, then a separate named Approval for packaging/certification only (unless Owner explicitly authorises a different next phase).
