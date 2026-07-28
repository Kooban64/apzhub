# APZ TCMS — Operational Readiness (Planning)

> **Programme:** APZ-TCMS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19

---

## Enablement (platform today)

| Control          | Requirement                                                     |
| ---------------- | --------------------------------------------------------------- |
| Auth             | Better Auth + testing/certification permissions                 |
| Gateway          | Platform API → `gateway.testing.*`                              |
| Persistence      | Platform PostgreSQL (TCMS metadata)                             |
| Evidence storage | S3-compatible / configured storage refs                         |
| CI provider      | GHA credentials as **references** only (when live path enabled) |
| Search           | search-testing publication when Search enabled                  |

---

## Release 1.0 ops targets (when packaged)

1. Health hierarchy contribution for Testing module/services/adapter
2. Diagnostics without exposing GitHub/Kiwi admin UIs as primary UX
3. Correlation IDs on testing API operations
4. Backup of PostgreSQL metadata + evidence storage
5. Notifications only via Platform Notification Framework (if authorised)

---

## Gaps vs commercial GA claim

| Area                       | Today  | Packaging need                             |
| -------------------------- | ------ | ------------------------------------------ |
| Commercial SemVer ops pack | Absent | Required under `docs/releases/tcms/1.0.0/` |
| GitLab ops                 | N/A    | Remain out of scope                        |
| Kiwi ops                   | N/A    | Remain out of scope                        |

---

## Related

- [APZTCMS-019 Production Readiness](../../reviews/APZTCMS-019-production-readiness.md) (GHA slice)
