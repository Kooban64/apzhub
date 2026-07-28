# APZ Documents 1.0.0 — Compatibility Statement

> **Release:** APZ Documents **1.0.0**  
> **Programme:** APZ-DOCUMENTS-002  
> **Status:** Certification filed — **Awaiting Acceptance**  
> **Date:** 2026-07-19

---

## Baseline

| Component                      | Version / status       | Notes                            |
| ------------------------------ | ---------------------- | -------------------------------- |
| `@apzhub/integration-sdk`      | **1.0.0**              | Architecture Frozen              |
| `@apzhub/document-contracts`   | **0.3.0**              | Canonical models + permissions   |
| `@apzhub/document-core`        | **0.3.0**              | Domain + coordinator             |
| `@apzhub/document-persistence` | **0.2.0**              | PostgreSQL + in-memory           |
| `@apzhub/document-storage`     | **0.1.0**              | FS · S3-compatible · memory      |
| `@apzhub/search-documents`     | **0.1.0**              | Search Publication (frozen wave) |
| Documents HTTP                 | `/api/v1/documents/*`  | Platform OpenAPI                 |
| Workbench                      | `/workspace/documents` | Manifest-driven                  |
| Paperless adapter              | **ABSENT**             | Excluded from Release 1.0        |

---

## Compatibility rules

1. Workbench consumes Platform HTTP only — no Module → Connector/storage bypass.
2. Breaking Documents HTTP requires Major SemVer + Owner Approval.
3. Integration SDK **1.0.0** changes require ADR + Owner.
4. APZDOCS architecture freeze remains until Owner-accepted unlock.
5. Introducing Paperless (or any DMS adapter) is a **new** integration programme — not a Patch to **1.0.0**.
6. Search consumers rely on Search Publication contracts — Documents does not own Unified Search UX.
7. Other Production products (Projects, Time, Support, Analytics, Workflow) are unaffected by this packaging.

---

## Consumers

| Consumer                          | Expectation                                            |
| --------------------------------- | ------------------------------------------------------ |
| APZHUB Workbench Documents module | HTTP `/api/v1/documents/*`                             |
| Platform Search                   | `search-documents` publication                         |
| Law Platform                      | May use Documents patterns; remains a separate product |
| Future Workflow automations       | Optional; not required for Documents 1.0.0             |
