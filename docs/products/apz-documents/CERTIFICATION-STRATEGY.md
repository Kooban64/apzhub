# APZ Documents — Certification Strategy (Release 1.0)

> **Programme:** APZ-DOCUMENTS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [PRODUCT-CERTIFICATION-STANDARD](../PRODUCT-CERTIFICATION-STANDARD.md) · [Platform Delivery Standard](../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md) · APZDOCS-006  
> **Date:** 2026-07-19

---

## Certification layers

| Layer                                   | Target                                | Notes                                                             |
| --------------------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| Platform vertical                       | APZDOCS-006 PRWL retained             | Already certified — packaging must not regress                    |
| Contracts / services / HTTP / Workbench | Re-verify gates for commercial claim  | Existing audits: `pnpm audit:document-vertical` + related scripts |
| Search publication                      | `search-documents` remains compatible | Search Publication Architecture Frozen                            |
| Product release                         | SemVer **1.0.0** evidence pack        | Future programme                                                  |
| Repository                              | QA-002 PRODUCTION READY held          | Continuous                                                        |

---

## Likely certification outcome class

**PRODUCTION_READY_WITH_LIMITATIONS** — matches APZDOCS-006 and honesty rules for metadata-first Documents. Not a defect if limitations are documented.

---

## Evidence pack (future path)

```text
docs/releases/documents/
docs/releases/documents/1.0.0/
  README.md
  RELEASE-NOTES.md
  COMPATIBILITY.md
  KNOWN-LIMITATIONS.md
  QUALITY-EVIDENCE.md
  CERTIFICATION-REPORT.md
  …
```

---

## Entry to certification

Commercial certification starts only after Owner Acceptance of this planning pack **and** Owner Approval of a named packaging/certification programme — not from this planning pack alone.

Do **not** re-run Platform Foundation → Workbench implementation programmes unless Owner scopes gap-filling beyond freeze.

---

## Related

- [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md)
- [TESTING-STRATEGY.md](./TESTING-STRATEGY.md)
- [IMPLEMENTATION-READINESS.md](./IMPLEMENTATION-READINESS.md)
