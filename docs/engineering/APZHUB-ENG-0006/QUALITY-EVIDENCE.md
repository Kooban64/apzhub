# APZHUB-ENG-0006 — Quality Evidence

> **Programme:** APZHUB-ENG-0006  
> **Date:** 2026-07-20  
> **Scope:** RG-HEALTH-503 → RG-AUTH-SHELL only

---

## Commands executed

| Gate                           | Command                                                          | Result                                      |
| ------------------------------ | ---------------------------------------------------------------- | ------------------------------------------- |
| Unit                           | `pnpm exec vitest run testing/playwright/web-server-env.test.ts` | **PASS** (1)                                |
| Runtime bootstrap (diagnostic) | `Runtime.bootstrap({ failFast: false })` after n8n fix           | **PASS** (267 capabilities, platformReady)  |
| Scoped Playwright              | SPR-001…007 specs under `CI=true`                                | **22 passed · 8 flaky · 4 failed** (~10.4m) |
| Architecture                   | Manifest schema compliance; no layer bypass                      | **PASS**                                    |
| Compatibility                  | Platform 1.2.0 packaging unchanged                               | **PASS**                                    |

### Scoped Playwright command

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.config.ts \
  testing/playwright/e2e/spr-001.spec.ts \
  testing/playwright/e2e/spr-002-runtime.spec.ts \
  testing/playwright/e2e/spr-003-workbench-context-selection.spec.ts \
  testing/playwright/e2e/spr-003-workbench-navigation.spec.ts \
  testing/playwright/e2e/spr-003-workbench-session.spec.ts \
  testing/playwright/e2e/spr-004-action-framework.spec.ts \
  testing/playwright/e2e/spr-005-knowledge-discovery-framework.spec.ts \
  testing/playwright/e2e/spr-006-event-notification-framework.spec.ts \
  testing/playwright/e2e/spr-007-activity-timeline-framework.spec.ts
```

---

## RG-HEALTH-503 Playwright results

| Test                                                      | Before     | After    |
| --------------------------------------------------------- | ---------- | -------- |
| spr-001 health endpoint returns platform status           | FAIL (503) | **PASS** |
| spr-002 health endpoint includes platform runtime summary | FAIL (503) | **PASS** |
| spr-004 health Action Framework summary                   | FAIL (503) | **PASS** |
| spr-005 health Knowledge Service summary                  | FAIL (503) | **PASS** |
| spr-006 health Event/Notification summaries               | FAIL (503) | **PASS** |
| spr-007 health Activity/Timeline summaries                | FAIL (503) | **PASS** |

**Remaining RG-HEALTH-503 failures:** **0**

---

## RG-AUTH-SHELL Playwright results

| Metric                                | Value                                                              |
| ------------------------------------- | ------------------------------------------------------------------ |
| Previously failing (group membership) | 20                                                                 |
| Hard remaining failures               | **4** (session persistence / palette execute / knowledge nav path) |
| Flaky (passed on retry)               | Present on several shell tests — auth seed works; timing residual  |

Evidence JSON: [20260720T185000Z-APZHUB-ENG-0006-RG-HEALTH-AUTH-SHELL.json](../../operations/evidence/portfolio-recert/20260720T185000Z-APZHUB-ENG-0006-RG-HEALTH-AUTH-SHELL.json)
