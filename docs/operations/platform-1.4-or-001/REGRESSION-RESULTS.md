# Regression Results — Platform-1.4-OR-001

> **Date:** 2026-07-23 · Honesty: do not claim checks not executed

## Quality gates

| Gate                                         | Status                            | Evidence                                                                                    |
| -------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm build`                                 | **PASS**                          | `/tmp/or001-build.log` · exit 0                                                             |
| `pnpm typecheck`                             | **PASS**                          | `/tmp/or001-typecheck.log` · apps/web Done                                                  |
| `pnpm lint`                                  | **PASS**                          | `/tmp/or001-lint.log` · eslint .                                                            |
| `pnpm format:check`                          | **PASS**                          | `/tmp/or001-format3.log` · All matched                                                      |
| Affected durable notification Vitest (76)    | **PASS**                          | eng001b P0–P4 + persistence + contracts                                                     |
| Full `pnpm test`                             | **FAIL**                          | 29 files failed · **49** tests failed · **5076** passed · 66 skipped · ~403s                |
| Live Postgres entity-mapping integration     | **PASS** (28)                     | `postgres-entity-mapping-store.integration.test.ts`                                         |
| Law RLS live integration                     | **PARTIAL**                       | Availability meta-test failed (postgres _is_ reachable); RLS cases skipped — **OR-DEF-003** |
| Playwright `pnpm test:e2e`                   | **FAIL** (after Chromium install) | **122 passed · 4 failed** (~9.6m) — see OR-DEF-004                                          |
| `pnpm ops:portfolio-recert -- --mode docker` | **PASS**                          | Evidence `20260723T153236Z-R12-QA-01-docker-PASS.json`                                      |
| `pnpm ops:portfolio-recert` playwright/full  | **NOT RUN**                       | Docker mode only in this programme pass                                                     |
| Certify:* vertical scripts                   | **NOT RUN** as separate scripts   | Covered partially via failing vertical certification Vitest pins                            |

## Full `pnpm test` failure themes (do not fix here)

| Theme                             | Examples                                                                                                                              | Defect ID      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Frozen vertical package pin drift | Expected `platform-services` **0.30.0**, got **0.32.0**; notification-contracts pin **0.2.0** vs **0.3.5**                            | **OR-DEF-002** |
| OpenAPI version allowlists        | Handlers expect ≤1.12.x; spec reports **1.14.0**                                                                                      | **OR-DEF-002** |
| Notification freeze audits        | Delivery/provider routes asserted absent; OpenAPI “delivery-leak” vs ENG-004/1.4 delivery surfaces                                    | **OR-DEF-002** |
| Architecture audit version pins   | Search/admin/config/identity/metrics/workflow/observe audits                                                                          | **OR-DEF-002** |
| Playwright residual (4)           | APZNOTIFY-004 metadata list; APZTCMS-022 a11y landmarks; Support Soft performance baseline; Support analytics visual screenshot drift | **OR-DEF-004** |

These failures are **certification pin / freeze drift** and residual UI/e2e issues relative to Platform 1.4 engineering — **not remediated** under OR-001.

## Durable notification regression subset

| Suite                                                               | Result |
| ------------------------------------------------------------------- | ------ |
| notification-contracts                                              | PASS   |
| notification-delivery-persistence (+ claim/lease + mocked postgres) | PASS   |
| eng004 / eng001b-p0 / p2 / p3 / p4                                  | PASS   |
