# APZ Workflow — Certification Strategy (Release 1.0)

> **Programme:** APZ-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [PRODUCT-CERTIFICATION-STANDARD](../PRODUCT-CERTIFICATION-STANDARD.md)  
> **Date:** 2026-07-19

---

## Certification layers

| Layer               | Target                                            | Notes                                                                          |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------ |
| Integration adapter | n8n adapter certified for Release 1.0 scope       | Today: Reference Adapter **0.1.0** read-only; execute scope needs ADR + recert |
| Platform services   | Workflow services for catalogue + execution plane | SoR services exist; execute plane absent                                       |
| HTTP API            | OpenAPI + security review                         | SoR + engine discovery present; extend for runs/schedules                      |
| Workbench / UI      | Playwright product cert                           | Dual facets exist; commercial UX TBD                                           |
| Product release     | SemVer **1.0.0** evidence pack                    | Future programme                                                               |
| Repository          | QA-002 PRODUCTION READY held                      | Continuous                                                                     |

---

## Likely certification outcome class

First commercial ship expected **PRODUCTION_READY_WITH_LIMITATIONS** (PRWL) given n8n CE constraints, human-in-the-loop scope, and multi-provider deferral — not a defect if limitations are documented.

Foundation wave already certified PRWL and **frozen** — commercial Release 1.0 must not silently claim execute/schedule until evidenced.

---

## Evidence pack (future path)

```text
docs/releases/workflow/1.0.0/
  README.md
  RELEASE-NOTES.md
  COMPATIBILITY.md
  QUALITY-EVIDENCE.md
  … + Known Limitations links
```

---

## Entry to certification

Certification starts only after Owner-approved implementation programmes deliver the Release 1.0 vertical — not from this planning pack.

---

## Related

- [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md)
- [TESTING-STRATEGY.md](./TESTING-STRATEGY.md)
