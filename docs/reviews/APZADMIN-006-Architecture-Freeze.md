# APZADMIN-006 — Architecture Freeze Review

**Date:** 2026-07-16

## Freeze declaration

The Administration metadata governance plane architecture is **frozen** as of APZADMIN-006.

Canonical notice: [Architecture Freeze Notice](../architecture/APZHUB-Administration-Architecture-Freeze-Notice.md)

## Frozen path (exclusive)

```text
Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authz
→ Platform Services → Core → Persistence → PostgreSQL
```

## Change policy

| Change type | Requirement |
| --- | --- |
| Behaviour / architecture | ADR + owner approval + new milestone |
| Documentation-only governance | Allowed under wave/closeout milestones |
| Identity / provisioning / runtime admin | New programme (e.g. APZIDENTITY) — not Administration SoR extension |

## Verdict

**FROZEN** — no alternative execution paths.
