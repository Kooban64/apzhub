# APZ Documents 1.0.0 — Operational Readiness

> **Release:** APZ Documents **1.0.0**  
> **Programme:** APZ-DOCUMENTS-002  
> **Status:** Certification filed — **Awaiting Acceptance**  
> **Date:** 2026-07-19

---

## Enablement

| Control     | Requirement                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| Auth        | Better Auth session + `document.*` permissions                                                              |
| Gateway     | Platform API pipeline → Document services                                                                   |
| Persistence | Platform PostgreSQL (document metadata)                                                                     |
| Storage     | Configured document-storage provider (filesystem / S3-compatible / memory) — credential **references** only |
| Search      | Search publication pipeline enabled for documents entities                                                  |
| Health      | Platform health hierarchy (module / service)                                                                |

---

## Operator checklist

1. Confirm Documents Workbench route `/workspace/documents` permission-gated
2. Confirm HTTP `/api/v1/documents` returns standard envelopes under AuthZ
3. Confirm storage provider health without exposing raw engine admin UI
4. Confirm secrets/credentials never appear in logs or repos
5. Confirm backup posture covers PostgreSQL metadata + configured storage backend
6. Confirm Known Limitations understood by operators (metadata-first)

---

## Limitations affecting ops

| Area                         | Posture                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| Binary upload/download ops   | **Not in scope** (APZDOCS non-goal)                                        |
| Paperless ops                | **N/A** — absent                                                           |
| Playwright live E2E          | **LIMITED** historically — revalidate in target environments               |
| Live postgres/S3 unit matrix | **LIMITED** in certification environment — ops deploy validates separately |

---

## Related

- [APZDOCS-006 Production Readiness](../../reviews/APZDOCS-006-production-readiness.md)
- [Administrator Guide](./guides/ADMINISTRATOR-GUIDE.md)
