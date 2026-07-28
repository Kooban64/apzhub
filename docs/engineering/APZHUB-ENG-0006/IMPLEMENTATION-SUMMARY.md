# APZHUB-ENG-0006 — Implementation Summary

> **Programme:** APZHUB-ENG-0006  
> **Title:** Implement RG-HEALTH-503 → RG-AUTH-SHELL Remediation  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-20  
> **Status:** Complete — **Awaiting Acceptance**

---

## Authorised remediation groups

| Group             | Result                                                                              |
| ----------------- | ----------------------------------------------------------------------------------- |
| **RG-HEALTH-503** | **Resolved** — 6/6 scoped health tests PASS                                         |
| **RG-AUTH-SHELL** | **Root cause resolved**; 4 residual UI/session/palette failures remain (documented) |

---

## Root causes fixed

1. **Runtime bootstrap → health 503** — `integrations/n8n/integration.yaml` used `documentation.supportedApiVersions` (array), rejected by manifest `z.record(string|boolean|number)`. `n8n` was not discovered → `workflow-service` dependency failed → `/api/health` returned **503**. Fixed to singular `supportedApiVersion: "v1"`.
2. **Playwright webServer env wipe** — `webServer.env` replaced `process.env`; now merged via `buildPlaywrightWebServerEnv`.
3. **Deterministic DEV auth** — Playwright `globalSetup` waits for healthy `/api/health`, signs in/registers `dev@apzhub.local` with `Origin` header, resets user via `scripts/e2e-reset-dev-user.ts` when credentials mismatch; SPR specs use `signInDevUser`.

---

## Repository impact

| Area                                      | Change                                    |
| ----------------------------------------- | ----------------------------------------- |
| `integrations/n8n/integration.yaml`       | Manifest documentation field fix          |
| `testing/playwright/playwright.config.ts` | Env merge + globalSetup                   |
| `testing/playwright/web-server-env.ts`    | Env merge helper + unit test              |
| `testing/playwright/global-setup.ts`      | Health wait + DEV auth seed               |
| `testing/playwright/e2e/auth-helpers.ts`  | Shared DEV sign-in                        |
| `testing/playwright/e2e/spr-00*.spec.ts`  | Use `signInDevUser`                       |
| `scripts/e2e-reset-dev-user.ts`           | Reset DEV user rows                       |
| `vitest.config.ts`                        | Include `testing/playwright/**/*.test.ts` |

---

## Architecture / SemVer

- **Architecture impact:** None (manifest validity + test harness).
- **SemVer impact:** None (no package version bumps).
- **Platform Services / commercial products:** Unchanged packaging.
- **Public APIs:** Unchanged.

---

## Out of scope (not modified)

RG-LAW-DNS · RG-A11Y-CONTRAST · RG-MOCK-FETCH · RG-PW-API · RG-SELECTORS · product workbench residuals · Email SoR · FIN-001 · Workflow Execute · Release 1.3 · ENG-0007

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
