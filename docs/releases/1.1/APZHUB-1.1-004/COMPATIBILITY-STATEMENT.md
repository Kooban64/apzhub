# APZHUB-1.1-004 — Compatibility Statement

> **Programme:** APZHUB-1.1-004  
> **Date:** 2026-07-20

---

## Public API compatibility

| Surface                                               | Posture                                                                     |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| Support / Projects / Time / Workflow HTTP `/api/v1/*` | **Unchanged**                                                               |
| BetterAuth / Identity APIs                            | **Unchanged**                                                               |
| Workbench surfaces                                    | **Unchanged**                                                               |
| ENF public service APIs                               | **Unchanged**                                                               |
| Workflow contracts / execute posture                  | **Unchanged** — execute remains gated                                       |
| platform-services                                     | **Additive** — `automation` on `createPlatformServices`; optional injection |

## SemVer

| Package / product                 | Version impact                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| APZHUB Platform commercial SemVer | Remains **1.0.0** Production Baseline                                                |
| `@apzhub/platform-services`       | Additive Automation Foundation — callers without automation unchanged (auto-created) |
| Workflow / n8n                    | No execute unlock; no SemVer claim change                                            |

## Behaviour notes (intentional)

1. Automation dispatch is fail-soft relative to Event Bus publish.
2. `workflow.trigger` executions are **deferred** (`WORKFLOW_EXECUTE_GATED`) until a future Owner-approved execute programme.
3. Default Support registrations journal only — they do not create Projects tasks (AU-01 still Owner-gated).

## Conclusion

**Compatible** with Release 1.0 public contracts.
