# APZHUB-1.1-004 — Operational Readiness

> **Programme:** APZHUB-1.1-004  
> **Date:** 2026-07-20  
> **Status:** Ready for Owner Acceptance (foundation operational with documented limits)

---

## What operators get

| Capability                                                                 | Status                                   |
| -------------------------------------------------------------------------- | ---------------------------------------- |
| Platform automation registration (in-memory MVP)                           | **Operational**                          |
| Event Bus → automation dispatch for Support / projects / platform patterns | **Operational**                          |
| Workflow trigger intent recording (deferred)                               | **Operational** (execute gated)          |
| Default Support → journal registrations                                    | **Operational** on web gateway bootstrap |

## What this is not

| Item                                   | Status                                       |
| -------------------------------------- | -------------------------------------------- |
| n8n / Workflow provider execute        | Still gated                                  |
| Durable Postgres automation SoR        | Future enhancement (in-memory journal today) |
| Product AU-01/AU-02 automations        | Require separate Owner Approval              |
| Email / notification delivery unfreeze | Unchanged                                    |

## Operate / verify

1. Gateway bootstrap creates shared `AutomationFoundation` + wires Event Bus.
2. Support mutations that publish domain events also journal automation executions.
3. Inspect via `foundation.list()` / `foundation.listExecutions()` in tests or future admin surfaces.
4. Regression:

```bash
pnpm exec vitest run \
  packages/platform-services/src/services/automation/automation-foundation.test.ts \
  apps/web/lib/cross-product-automation-foundation.test.ts
```

## Rollback posture

Optional `automation` injection on `createPlatformServices` — omitting uses a fresh foundation. Event Bus publish path remains fail-soft if automation handlers fail.
