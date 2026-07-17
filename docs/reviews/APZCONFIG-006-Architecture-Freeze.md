# APZCONFIG-006 — Architecture Freeze Review

**Date:** 2026-07-16

## Freeze declaration

The Configuration metadata management plane architecture is **frozen** as of APZCONFIG-006.

Canonical notice: [Architecture Freeze Notice](../architecture/APZHUB-Configuration-Architecture-Freeze-Notice.md)

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
| Runtime/secrets/flags capabilities | New programme — not Configuration SoR extension |

## Verdict

**FROZEN** — no alternative execution paths.
