# APZIDENTITY-006 — Architecture Freeze Review

**Date:** 2026-07-17

## Freeze declaration

The Identity Administration metadata plane architecture is **frozen** as of APZIDENTITY-006.

Canonical notice: [Architecture Freeze Notice](../architecture/APZHUB-Identity-Architecture-Freeze-Notice.md)

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
| Authentication / provisioning / directory sync | New programme — not Identity SoR extension without ADR |

## Verdict

**FROZEN** — no alternative execution paths.
