# APZ Law Platform — Operational Readiness (Planning)

> **Programme:** APZ-LAW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19

---

## Enablement (platform / product today)

| Control                  | Requirement                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| Auth                     | Better Auth + legal permission keys                                     |
| App                      | `apps/law-platform` (port **3301** coexistence)                         |
| Persistence              | Platform PostgreSQL (native Law schemas)                                |
| Health                   | Law `/api/health` · platform system health/readiness/liveness routes    |
| Governance / security    | platform/v1 governance · security routes in law-platform                |
| Search / Knowledge       | Law search + service.yaml knowledge registrations                       |
| Notifications / activity | Platform ENF / Activity frameworks — durable stores (OBS-LAW-02 closed) |
| Trust                    | Trust services within Law (LAW-015)                                     |

---

## Release 1.0 ops targets (when packaged)

1. Health hierarchy contribution for Law app / legal-platform service / Trust
2. Diagnostics without exposing third-party legal suite admin UIs as primary UX
3. Correlation IDs on Law API operations
4. Backup of PostgreSQL Law schemas (+ any document blob refs)
5. Notifications only via Platform Notification Framework
6. Secrets never in logs/UI/repos; trust/billing data handling documented

---

## Gaps vs commercial GA claim

| Area                       | Today                       | Packaging need                            |
| -------------------------- | --------------------------- | ----------------------------------------- |
| Commercial SemVer ops pack | Absent                      | Required under `docs/releases/law/1.0.0/` |
| OBS-LAW-01                 | **Closed** (APZHUB-1.1-001) | Session AuthZ on Law paths                |
| OBS-LAW-02                 | **Closed** (APZHUB-1.1-002) | Durable ENF/ATF session stores            |
| Placeholder UX             | Present                     | Honest KL in release pack                 |
| Financial Engine ops       | N/A (deferred)              | Remain out of scope                       |

---

## Related

- [Law Platform Readiness](../../reviews/APZHUB-Law-Platform-Readiness.md)
- [docs/products/law/IMPLEMENTATION-READINESS.md](../law/IMPLEMENTATION-READINESS.md)
