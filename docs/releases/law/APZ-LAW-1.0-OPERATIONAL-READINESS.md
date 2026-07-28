# APZ Law Platform 1.0.0 — Operational Readiness

> **Release:** APZ Law Platform **1.0.0**  
> **Programme:** APZ-LAW-002  
> **Date:** 2026-07-19

---

## Enablement controls

| Control                  | Requirement                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------- |
| Auth                     | Better Auth + legal permission keys                                                   |
| App                      | `apps/law-platform` (port **3301**)                                                   |
| Persistence              | Platform PostgreSQL (native Law schemas)                                              |
| Health                   | `/api/health` · platform system health/readiness/liveness                             |
| Governance / security    | platform/v1 governance · security routes                                              |
| Trust                    | Trust services within Law (LAW-015)                                                   |
| Search / Knowledge       | Law search + service.yaml knowledge registrations                                     |
| Notifications / activity | Platform ENF / Activity — durable session stores (OBS-LAW-02 closed — APZHUB-1.1-002) |

---

## Ops targets (certified posture)

1. Health hierarchy contribution for Law app / legal-platform / Trust
2. Diagnostics without third-party legal suite admin UIs as primary UX
3. Correlation IDs on Law API operations
4. Backup of PostgreSQL Law schemas (+ document blob refs if used)
5. Notifications only via Platform Notification Framework
6. Secrets never in logs/UI/repos

---

## Residual ops honesty

| Item              | Posture                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| OBS-LAW-01        | **Closed** by APZHUB-1.1-001 — Law paths use session AuthZ (`mode: "auth"`); no empty-grant `*` injection |
| OBS-LAW-02        | **Closed** by APZHUB-1.1-002 — platform-owned durable ENF/ATF session stores (tenant/user scoped)         |
| Placeholder UX    | Documented — not marketed as complete polish                                                              |
| OpenAPI ↔ runtime | Operators verify claimed routes in target environment                                                     |

---

## Related

- [Post-Release Verification](./1.0.0/POST-RELEASE-VERIFICATION.md)
- [Known Limitations](../../products/apz-law/KNOWN-LIMITATIONS.md)
