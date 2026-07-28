# APZ Documents — Compatibility Statement (Planning)

> **Programme:** APZ-DOCUMENTS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Status:** Planning baseline — not a Production SemVer compatibility claim

---

## Current disk baseline (platform)

| Component                                            | Version / status                            | Notes                             |
| ---------------------------------------------------- | ------------------------------------------- | --------------------------------- |
| `@apzhub/integration-sdk`                            | **1.0.0**                                   | Architecture Frozen               |
| `@apzhub/document-contracts`                         | **0.3.0**                                   | Canonical models + gateway facets |
| `@apzhub/document-core`                              | **0.3.0**                                   | Domain + coordinator              |
| `@apzhub/document-persistence`                       | **0.2.0**                                   | PostgreSQL + in-memory            |
| `@apzhub/document-storage`                           | **0.1.0**                                   | FS · S3-compatible · memory       |
| `@apzhub/search-documents`                           | **0.1.0**                                   | Search publication (frozen wave)  |
| Documents HTTP                                       | `/api/v1/documents`                         | Platform OpenAPI                  |
| Workbench                                            | `/workspace/documents`                      | Manifest-driven                   |
| Paperless adapter                                    | **ABSENT**                                  | Excluded from Release 1.0         |
| APZ Projects / Time / Support / Analytics / Workflow | Production SemVers (or Awaiting Acceptance) | Unaffected by this planning pack  |

---

## Release 1.0 compatibility rules (future packaging)

1. Workbench consumes Platform HTTP only — no Module → Connector bypass.
2. Breaking Documents HTTP requires Major SemVer + Owner Approval.
3. Integration SDK **1.0.0** changes require ADR + Owner.
4. APZDOCS architecture freeze remains until Owner-accepted unlock.
5. Introducing Paperless (or any DMS adapter) is a **new** integration programme — not a silent patch to Documents 1.0.0.
6. Search consumers rely on Search Publication contracts — Documents does not own Unified Search UX.

---

## This programme

Documentation only — **no** package or API version changes.
