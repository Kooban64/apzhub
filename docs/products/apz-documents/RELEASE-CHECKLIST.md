# APZ Documents — Release 1.0 Checklist

> **Programme:** APZ-DOCUMENTS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Complements:** [RELEASE-GOVERNANCE-CHECKLIST](../../releases/RELEASE-GOVERNANCE-CHECKLIST.md) · Platform Delivery Standard  
> **Date:** 2026-07-19

---

## A. Before packaging/certification programme

| #   | Check                                                      | Status now                |
| --- | ---------------------------------------------------------- | ------------------------- |
| A1  | Release Definition Pack complete                           | **Done** (this programme) |
| A2  | Owner Acceptance of APZ-DOCUMENTS-001                      | Pending                   |
| A3  | Scope locked to APZDOCS-006 PRWL (metadata-first)          | **Documented**            |
| A4  | Paperless / binary DMS exclusions explicit                 | **Documented**            |
| A5  | Named Owner Approval for packaging/certification programme | **Open**                  |
| A6  | Integration SDK **1.0.0** freeze respected                 | **Held**                  |
| A7  | APZDOCS architecture freeze respected                      | **Held**                  |

---

## B. Before Release Candidate (packaging programme)

| #   | Check                                                            |
| --- | ---------------------------------------------------------------- |
| B1  | Vertical audits green (`pnpm audit:document-vertical` + related) |
| B2  | OpenAPI validate PASS                                            |
| B3  | Typecheck · lint · build PASS for web / touched packages         |
| B4  | Playwright Documents smoke revalidated (or limitation restated)  |
| B5  | Known Limitations filed for SemVer **1.0.0**                     |
| B6  | No Paperless / DMS brand in standard UI                          |
| B7  | No Module → Connector bypass                                     |
| B8  | Secrets never in logs/UI/repos                                   |

---

## C. Before Owner Acceptance of SemVer 1.0.0

| #   | Check                                                              |
| --- | ------------------------------------------------------------------ |
| C1  | `docs/releases/documents/1.0.0/` complete                          |
| C2  | Certification class + single recommendation filed                  |
| C3  | Portfolio / commercial catalogue / RELEASES.md / CHANGELOG updated |
| C4  | OWNER-ACCEPTANCE-REGISTER + AI-MANIFEST updated                    |
| C5  | No unauthorised scope expansion                                    |

---

## This programme

Documentation only — checklist items B/C are **not** executed here.
