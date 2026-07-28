# APZHUB Business Continuity

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20

---

## Purpose

Keep critical business functions available when APZHUB or a dependent engine is impaired.

## Critical business functions (platform view)

| Function                  | Depends on           | Continuity mode                           |
| ------------------------- | -------------------- | ----------------------------------------- |
| Authenticated work access | Identity · Gateway   | Fail closed — no anonymous bypass         |
| Project execution         | Projects · Plane     | Read-only / deferred work if engine down  |
| Support intake            | Support · Zammad     | Queue offline intake only if pre-approved |
| Time capture              | Time · Kimai         | Local notes → later sync (manual)         |
| Legal matter access       | Law Platform         | Local durable UX state ≠ SoR              |
| Reporting                 | Analytics · Metabase | Cached/export fallback                    |

## Continuity principles

1. **No security bypass** for continuity (Document **013**).
2. Prefer degraded mode with clear user messaging over incorrect data.
3. Engine outages are translated to APZHUB product language.
4. STOP capabilities (Email SoR, Workflow execute) are not continuity dependencies.

## BCP testing

Annual tabletop: Identity loss · Platform DB restore · Engine adapter outage · Host coexistence failure.
