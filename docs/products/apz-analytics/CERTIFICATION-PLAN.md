# APZ Analytics — Certification Plan (Release 1.0)

> **Programme:** APZ-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [PRODUCT-CERTIFICATION-STANDARD](../PRODUCT-CERTIFICATION-STANDARD.md)  
> **Date:** 2026-07-19

---

## Certification layers

| Layer               | Target                          | Notes            |
| ------------------- | ------------------------------- | ---------------- |
| Integration adapter | Metabase adapter certified (CE) | Prerequisite     |
| Platform services   | Analytics services vertical     | After adapter    |
| HTTP API            | OpenAPI + security review       |                  |
| Workbench / UI      | Playwright cert                 |                  |
| Product release     | SemVer **1.0.0** evidence pack  | Owner Acceptance |
| Repository          | QA-002 PRODUCTION READY held    | Continuous       |

---

## Likely certification outcome class

First ship is expected **PRODUCTION_READY_WITH_LIMITATIONS** (PRWL) given curated-dashboard scope and Metabase CE constraints — not a defect if limitations are documented.

---

## Evidence pack (future path)

```text
docs/releases/analytics/1.0.0/
  README.md
  RELEASE-NOTES.md
  COMPATIBILITY.md
  QUALITY-EVIDENCE.md
  KNOWN-LIMITATIONS.md
```

Plus completion / acceptance reports under `docs/sprint/` and `docs/foundation/completion-reports/`.

---

## Entry to certification

Certification starts only after Owner-approved implementation programmes deliver the vertical — not from this planning pack.

---

## Related

- [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md)
- [QUALITY-PLAN.md](./QUALITY-PLAN.md)
