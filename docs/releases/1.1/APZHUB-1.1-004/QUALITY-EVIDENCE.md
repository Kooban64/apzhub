# APZHUB-1.1-004 — Quality Evidence

> **Programme:** APZHUB-1.1-004  
> **Date:** 2026-07-20  
> **Scope:** Cross-Product Automation Foundation

---

## Gates executed

| Gate                          | Command / evidence                                                                 | Result   |
| ----------------------------- | ---------------------------------------------------------------------------------- | -------- |
| Typecheck (platform-services) | `pnpm --filter @apzhub/platform-services typecheck`                                | **PASS** |
| Typecheck (web)               | `pnpm --filter @apzhub/web typecheck`                                              | **PASS** |
| Lint (changed files)          | eslint on automation + gateway paths                                               | **PASS** |
| Unit — AutomationFoundation   | `automation-foundation.test.ts` (7)                                                | **PASS** |
| Integration — Event Bus wire  | `cross-product-automation-foundation.test.ts` (2)                                  | **PASS** |
| Event regression              | `support-domain-events.test.ts` (3)                                                | **PASS** |
| Architecture boundary         | No product automation engine; Platform Service only; Workflow execute not unlocked | **PASS** |
| Compatibility                 | See [COMPATIBILITY-STATEMENT.md](./COMPATIBILITY-STATEMENT.md)                     | **PASS** |

**Totals:** 12 tests PASS in automation + event regression suite above.

---

## Automation / event regression coverage

| Scenario                                | Expected                          | Covered |
| --------------------------------------- | --------------------------------- | ------- |
| Support request event → journal handler | succeeded / JOURNALED             | Yes     |
| Same envelope twice                     | IDEMPOTENT_SKIP                   | Yes     |
| workflow.trigger registration           | deferred / WORKFLOW_EXECUTE_GATED | Yes     |
| WorkflowEventTriggerSource binding      | deferred with triggerId           | Yes     |
| Bus wire publish → foundation           | succeeded execution recorded      | Yes     |
| Missing handler                         | failed / HANDLER_NOT_FOUND        | Yes     |

---

## Not run (out of scope)

Full monorepo Playwright · Docker rebuild · Platform 1.1.0 certification · n8n live execute E2E · AU-01 product automation
