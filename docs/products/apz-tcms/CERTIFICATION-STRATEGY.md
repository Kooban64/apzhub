# APZ TCMS — Certification Strategy (Release 1.0)

> **Programme:** APZ-TCMS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [PRODUCT-CERTIFICATION-STANDARD](../PRODUCT-CERTIFICATION-STANDARD.md) · Platform Delivery Standard · APZTCMS vertical certs  
> **Date:** 2026-07-19

---

## Path

**Existing Platform → Commercial Packaging** — certify SemVer **1.0.0** against existing APZTCMS evidence; do not re-implement platform phases.

---

## Certification layers

| Layer                                   | Target                                   | Notes                                        |
| --------------------------------------- | ---------------------------------------- | -------------------------------------------- |
| Platform verticals                      | Retain APZTCMS PRWL slice certifications | e.g. GHA APZTCMS-019                         |
| Contracts / services / HTTP / Workbench | Re-verify gates for commercial claim     | Existing audits + packaging programme checks |
| Search publication                      | `search-testing` compatibility           | Search Publication frozen                    |
| Product release                         | SemVer **1.0.0** evidence pack           | Future programme                             |
| Repository                              | QA-002 held                              | Continuous                                   |

---

## Likely certification outcome class

**PRODUCTION_READY_WITH_LIMITATIONS** — matches GHA and other certified slices; honesty for deferred GitLab/AI/Kiwi.

---

## Evidence pack (future)

```text
docs/releases/tcms/
docs/releases/tcms/1.0.0/
```

---

## Entry

Commercial certification starts only after Owner Acceptance of this planning pack **and** Owner Approval of a named packaging programme.
