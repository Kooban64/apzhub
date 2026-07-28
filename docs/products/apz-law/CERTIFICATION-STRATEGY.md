# APZ Law Platform — Certification Strategy (Release 1.0)

> **Programme:** APZ-LAW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [PRODUCT-CERTIFICATION-STANDARD](../PRODUCT-CERTIFICATION-STANDARD.md) · Platform Delivery Standard · Law readiness review  
> **Date:** 2026-07-19

---

## Path

**Existing Platform → Commercial Packaging** — certify SemVer **1.0.0** against existing LAW evidence; do not re-implement platform phases.

---

## Certification layers

| Layer                 | Target                                    | Notes                              |
| --------------------- | ----------------------------------------- | ---------------------------------- |
| Engineering vertical  | Retain LAW-001…015 closed evidence        | Trust LAW-015 included             |
| App / domain packages | Re-verify gates for commercial claim      | law-platform · legal-business-core |
| OpenAPI / API honesty | Map LAW-OpenAPI-v1 to runtime             | Packaging programme                |
| AuthZ / tenant        | Evidence OBS-LAW-01 / tenant claim status | Limitations if residual            |
| Product release       | SemVer **1.0.0** evidence pack            | Future programme                   |
| Repository            | QA-002 held                               | Continuous — not Law GA alone      |

---

## Likely certification outcome class

**PRODUCTION_READY_WITH_LIMITATIONS** — expected if packaging confirms native domains + Trust with honest KL (placeholder UX, OBS items, FIN-001 deferral). Packaging may conclude stricter conditions if OpenAPI/runtime or AuthZ gaps fail gates — do not pre-declare Production without evidence.

---

## Evidence pack (future)

```text
docs/releases/law/
docs/releases/law/1.0.0/
```

---

## Entry

Commercial certification starts only after Owner Acceptance of this planning pack **and** Owner Approval of a named packaging programme.
