# APZHUB-QA-CERT-003 — Final Certification

> **Programme:** APZHUB-QA-CERT-003  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21

---

## Gate matrix

| Gate               | Command / method                                       | Result                                                                            |
| ------------------ | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Lint               | `pnpm lint`                                            | **PASS** (exit 0)                                                                 |
| Typecheck          | `pnpm typecheck`                                       | **PASS** (exit 0)                                                                 |
| Unit + Integration | `pnpm test` (Vitest)                                   | **PASS** — 5013 passed / 66 skipped / 0 failed                                    |
| Integration script | `pnpm test:integration`                                | **N/A** — script not present; Vitest is repository-approved unit+integration gate |
| Regression         | Vitest + portfolio Playwright full                     | **FAIL** (Playwright non-zero)                                                    |
| E2E                | `pnpm test:e2e` via `ops:portfolio-recert --mode full` | **FAIL**                                                                          |
| OpenAPI (Platform) | `pnpm openapi:validate:platform`                       | **PASS**                                                                          |
| OpenAPI (Law)      | `pnpm openapi:validate`                                | **PASS**                                                                          |
| Portfolio path     | `pnpm ops:portfolio-recert -- --mode path`             | **PASS**                                                                          |
| Portfolio full     | `pnpm ops:portfolio-recert -- --mode full`             | **FAIL**                                                                          |
| Architecture       | Certification-only verification (no mutations)         | **PASS**                                                                          |
| Compatibility      | Packaging / contracts / OpenAPI / SemVer unchanged     | **PASS**                                                                          |

---

## Scope certified (as exercised)

| Layer                                              | Coverage under this run                                                                                                                 |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Platform Runtime / Workbench / Identity / Registry | Exercised via SPR + workbench E2E and Vitest                                                                                            |
| Platform Services                                  | Exercised via Vitest + HTTP/workbench E2E surfaces                                                                                      |
| Integrations                                       | Zammad and related adapters covered in Vitest; Support E2E                                                                              |
| Products                                           | Projects, Time, Support, Documents, TCMS, Analytics, Workflow, Law DX, Notifications, Admin, Config, Identity, Observe, Metrics, Search |

---

## Overall Certification Status

# CERTIFICATION FAILED

Authoritative residual: **1** Playwright hard failure (Support visual analytics baseline). **6** flaky tests passed on retry.
