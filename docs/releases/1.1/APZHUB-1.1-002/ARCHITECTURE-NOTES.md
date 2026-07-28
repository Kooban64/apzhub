# APZHUB-1.1-002 — Architecture Notes (OBS-LAW-02)

> **Programme:** APZHUB-1.1-002  
> **Date:** 2026-07-19  
> **Related:** [LAW-012-01 Persistence Architecture](../../../architecture/LAW-012-01-Persistence-Architecture.md) §9–10

---

## Law activity / notification path (post OBS-LAW-02)

```text
legal.* / capability.action.* events
  → Event Bus
  → ENF / ATF mappers
  → NotificationService / ActivityService
  → Persisted*SessionStore (tenant+user scoped storage key)
  → Workbench notification panel / Law activity feed
```

## Design rules preserved

1. Modules publish events only — no Law-owned notify/activity subsystem.
2. Persistence is platform-owned behind existing session-store interfaces.
3. Sync public store APIs unchanged (snapshot durability underneath).
4. Health / registry hydration remains registries-only.

## Closed observation

**OBS-LAW-02** — session-only UX for Law activity/notifications closed via durable platform session stores scoped by tenant/user.

## Explicit non-goals retained

| Item                                                           | Posture                                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| PostgreSQL `activity_projection` / `notification_inbox` tables | Future platform enhancement (LAW-012 fallback schema remains design reference) |
| APZNOTIFY management-plane HTTP as shell notify SoR            | Not used (semantic mismatch)                                                   |
| Real-time ActivityTransport                                    | Still deferred (SPR-007)                                                       |
