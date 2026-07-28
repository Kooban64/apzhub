# Release 1.2 — Platform Capability Review

> **Programme:** APZHUB-1.2-001  
> **Date:** 2026-07-20

---

## Disposition legend

Stable · Needs Improvement · Needs Expansion · Future Roadmap

| Capability                                    | Posture                                             | 1.2 action                                             |
| --------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| **Identity** (BetterAuth + PermissionService) | **Stable**                                          | Continuous Zero Trust hygiene (P1); no redesign        |
| **Workbench** (DEF shell)                     | **Stable**                                          | Maintain; product modules polish only                  |
| **Platform Services**                         | **Stable** / selective **Needs Improvement**        | Persistence honesty for automation/Law stores          |
| **Integration SDK**                           | **Stable** (frozen 1.0.0)                           | New adapters only via Integration SDK; **no unfreeze** |
| **Search**                                    | **Needs Expansion**                                 | `search-time` / `search-law` publishers (P0)           |
| **Workflow** (platform)                       | **Stable** (execute gated)                          | Persist journal; no Execute unlock                     |
| **Analytics** (platform)                      | **Stable**                                          | Maintain; embed Future Roadmap (1.3)                   |
| **Documents** (platform)                      | **Stable** (metadata)                               | Binary path Future Roadmap                             |
| **Testing** (TCMS platform)                   | **Needs Expansion**                                 | GitLab CI adapter                                      |
| **Legal** (Law platform)                      | **Needs Improvement**                               | Session Postgres + UX polish                           |
| **Automation Foundation**                     | **Needs Improvement**                               | Postgres journal + selective AU-*                      |
| **Notification Foundation**                   | **Needs Expansion** (Attention OK; delivery absent) | Delivery providers → 1.3/2.0 (not Email SoR claim)     |
| **Event Bus**                                 | **Stable** (MVP 0.1.0)                              | Maintain; Support already publishes                    |

## Explicit non-redesign

Identity · Workbench · Integration SDK · Search architecture · Event Bus topology — **no redesign** in 1.2.
