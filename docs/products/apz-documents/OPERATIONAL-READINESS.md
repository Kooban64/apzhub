# APZ Documents — Operational Readiness (Planning)

> **Programme:** APZ-DOCUMENTS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19

---

## Enablement (platform today)

| Control | Requirement                                                                                    |
| ------- | ---------------------------------------------------------------------------------------------- |
| Auth    | Better Auth session + `document.*` permissions                                                 |
| Gateway | Standard platform API pipeline → Documents services                                            |
| Storage | Document storage providers configured via platform config (refs — never plain secrets in repo) |
| Search  | Search publication pipeline for documents entities                                             |
| Health  | Platform health hierarchy contribution (module/service)                                        |

---

## Release 1.0 ops targets (when commercially packaged)

1. Health hierarchy: platform → workspace → module → service → storage provider
2. Diagnostics without exposing raw storage engine admin UIs to standard users
3. Correlation IDs on document API operations
4. Secrets / storage credentials as references only
5. Backup/restore posture documented for PostgreSQL metadata + configured storage backend
6. Alerting via Platform Notification Framework (if authorised) — no Documents-owned notify subsystem

---

## Operational gaps vs commercial GA claim

| Area                       | Today                            | Release 1.0 packaging need                        |
| -------------------------- | -------------------------------- | ------------------------------------------------- |
| Commercial SemVer ops pack | Absent                           | Required under `docs/releases/documents/1.0.0/`   |
| Binary content ops         | Constrained by APZDOCS non-goals | Document as limitation — do not invent upload ops |
| Paperless ops              | N/A (absent)                     | Remain out of scope                               |
| Playwright E2E confidence  | LIMITED historically             | Revalidate at certification                       |

---

## Related

- [APZDOCS-006 Production Readiness](../../reviews/APZDOCS-006-production-readiness.md)
- Portfolio pack: [documents/](../documents/README.md)
