# APZHUB Release 1.1 — Dependency Roadmap

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-19

| Dependency                               | Blocks / enables                     | Guidance                                   |
| ---------------------------------------- | ------------------------------------ | ------------------------------------------ |
| Platform **1.0.0** ACCEPTED              | All 1.1 work                         | **Met** (Owner Decision)                   |
| This planning pack ACCEPTED              | Named 1.1 programmes                 | Pending                                    |
| Integration SDK freeze                   | Adapter changes                      | Hold unless ADR+Owner                      |
| Event Bus / Outbox / Notifications spine | Support + Law OBS-02 + cross-product | Prefer enhance consumption, not redesign   |
| PermissionService maturity               | OBS-LAW-01                           | Security-first sequencing                  |
| Workflow CERTIFIED_FOUNDATION            | Execute unlock programmes            | Gate separately                            |
| Documents certified non-goals            | Binary DMS work                      | Explicit Owner unlock required             |
| FIN-001 DEFER                            | Shared billing engine                | Do not start in 1.1                        |
| GHA Reference Adapter freeze             | TCMS CI changes                      | Hold; GitLab is new programme              |
| Host coexistence (ENVIRONMENT.md)        | Ops changes                          | Non-disruptive only                        |
| Product SemVer packs                     | Platform 1.1.0 certification         | Certify products before/with platform pack |

```text
Security (AuthZ) → Law UX/persistence → Support events/notify
        ↘
         Cross-product automation slice
        ↘
         Time / Analytics / Workflow selective
        ↘
         Platform 1.1.0 certification
```
