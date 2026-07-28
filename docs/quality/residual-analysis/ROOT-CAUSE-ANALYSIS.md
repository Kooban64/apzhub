# Root Cause Analysis — Residual Certification Failures

> **Programme:** APZHUB-QA-RECERT-002  
> **Baseline:** Platform **1.2.0**  
> **Method:** Repository evidence only (CERT-001 logs + specs + configs)  
> **Engineering:** Forbidden in this programme

## Executive finding

CERT-001 failed because residual defects span **three domains**:

1. **Test portfolio hygiene** — Law Trust suite mis-scoped into main E2E; certification SemVer/OpenAPI pins frozen below Platform 1.2.0 catalogue versions.
2. **Auth/session stability** — Better Auth origin/session failures still close browsers mid-suite (4 hard + 30 flaky).
3. **Product/workbench residual** — Support cert, Observe journey, Law API authz fixtures, Law search integration, Testing architecture boundary, Law host lint/typecheck, inbox visual.

Orders 1–6 closed the large Support/Finance/Observe/Visual clusters from the prior remediation train. Remaining failures are a **new residual set** requiring a **new** remediation plan (this pack).

---

## RCA-01 — Law Trust suite origin mismatch

| Field            | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Failures         | QA2-F-002…008 (7)                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Category         | Test infrastructure · Configuration                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Root cause       | `law-015-trust-workflow.spec.ts` is included by main Playwright `testMatch` / default discovery under `pnpm test:e2e` (baseURL `:3300`). Helpers and Law auth expect `PLAYWRIGHT_LAW_*` / Law origin `:3302`. Better Auth rejects `http://localhost:3302` as invalid origin when the main web app session context is active, or conversely Law helpers hit the wrong host. Spec belongs exclusively under `playwright.law.config.ts` (`testMatch: **/law-015-trust-workflow.spec.ts`). |
| Location         | `testing/playwright/e2e/law-015-trust-workflow.spec.ts`, `testing/playwright/helpers/law-auth-helpers.ts`, `playwright.config.ts`, `playwright.law.config.ts`                                                                                                                                                                                                                                                                                                                          |
| Owning package   | `testing/playwright` (+ Law host for true Trust E2E)                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Owning product   | APZ Law                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Platform service | Law Trust / Auth                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Severity         | High (7 hard fails, pure config)                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Reproducibility  | High                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Effort           | S (exclude from main; ensure Law project runs Trust)                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Groupable        | Yes → RG-LAW-SUITE-SCOPE                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

---

## RCA-02 — Certification SemVer / OpenAPI pin drift

| Field            | Value                                                                                                                                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Failures         | QA2-V-001…050 (**50** = 47 regression + 3 OpenAPI unit)                                                                                                                                                                                                                    |
| Category         | Regression · Test defect                                                                                                                                                                                                                                                   |
| Root cause       | Wave/certification Vitest suites assert frozen package and OpenAPI versions that predate Platform **1.2.0** catalogue bumps (e.g. `@apzhub/platform-services` expected **0.26.1**; OpenAPI **1.12.0** vs whitelist ≤**1.10.0**). Product versions advanced; tests did not. |
| Location         | Multiple under `packages/*/src/**/*.test.ts`, OpenAPI handler tests, foundation certification suites                                                                                                                                                                       |
| Owning package   | Various (test owners + package owners for pin policy)                                                                                                                                                                                                                      |
| Owning product   | Platform (cross-cutting)                                                                                                                                                                                                                                                   |
| Platform service | N/A (quality gates)                                                                                                                                                                                                                                                        |
| Severity         | High (blocks Vitest gate)                                                                                                                                                                                                                                                  |
| Reproducibility  | High                                                                                                                                                                                                                                                                       |
| Effort           | M (bulk pin update + policy to prevent freeze lag)                                                                                                                                                                                                                         |
| Groupable        | Yes → RG-CERT-PIN-DRIFT                                                                                                                                                                                                                                                    |

---

## RCA-03 — Law host lint + TypeScript hygiene

| Field            | Value                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| Failures         | QA2-L-001, QA2-T-001                                                                                      |
| Category         | Lint · Build / TypeScript                                                                                 |
| Root cause       | Unused export/symbol `setSessionLawPersistenceContext`; boundary test indexes tuple incorrectly (TS2493). |
| Location         | `apps/law-platform/lib/persistence/law-persistence-scope.ts`, `…/r12-persist-02-boundary.test.ts`         |
| Owning package   | `apps/law-platform`                                                                                       |
| Owning product   | APZ Law                                                                                                   |
| Platform service | Law Persistence                                                                                           |
| Severity         | Medium (blocks lint/typecheck gates)                                                                      |
| Reproducibility  | High                                                                                                      |
| Effort           | S                                                                                                         |
| Groupable        | Yes → RG-LAW-HOST-QUALITY                                                                                 |

---

## RCA-04 — Law API permission fixture inversion

| Field            | Value                                                                                                                                                                                                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Failures         | QA2-V-051…074 (**24**)                                                                                                                                                                                                                                                                        |
| Category         | Authentication · Test defect                                                                                                                                                                                                                                                                  |
| Root cause       | Law API route tests expect 2xx for operations that return 403 (or expect 403 and get 2xx). Fixture authz context / permission matrix for test harness does not match production PermissionService behaviour after 1.2.0 Law changes. Cascading TypeErrors when response body assumed present. |
| Location         | Law API / authz Vitest suites under `apps/law-platform` and related packages                                                                                                                                                                                                                  |
| Owning package   | `apps/law-platform`                                                                                                                                                                                                                                                                           |
| Owning product   | APZ Law                                                                                                                                                                                                                                                                                       |
| Platform service | Permission / Law API                                                                                                                                                                                                                                                                          |
| Severity         | High                                                                                                                                                                                                                                                                                          |
| Reproducibility  | High                                                                                                                                                                                                                                                                                          |
| Effort           | M–L                                                                                                                                                                                                                                                                                           |
| Groupable        | Yes → RG-LAW-API-AUTHZ                                                                                                                                                                                                                                                                        |

---

## RCA-05 — Auth / shell residual instability

| Field            | Value                                                                                                                                                                                                                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Failures         | QA2-F-016…019 (4 hard) + QA2-FL-001…030 (30 flaky)                                                                                                                                                                                                                                                             |
| Category         | Authentication · Timing / Race                                                                                                                                                                                                                                                                                 |
| Root cause       | Continuation of historical RG-AUTH-SHELL: Better Auth “Invalid password” / session establishment races; browser contexts closed during `page.goto`; first-attempt flakes across SPR shell suites and selected workbenches. Not fully eliminated by Orders 1–6 (those targeted Support/Finance/Observe/Visual). |
| Location         | `testing/playwright/e2e/spr-00*.spec.ts`, auth helpers, Better Auth config                                                                                                                                                                                                                                     |
| Owning package   | `apps/web` · auth · testing/playwright                                                                                                                                                                                                                                                                         |
| Owning product   | Platform Shell                                                                                                                                                                                                                                                                                                 |
| Platform service | Auth (Better Auth) · Shell                                                                                                                                                                                                                                                                                     |
| Severity         | High                                                                                                                                                                                                                                                                                                           |
| Reproducibility  | High (hard) / Medium (flake)                                                                                                                                                                                                                                                                                   |
| Effort           | L                                                                                                                                                                                                                                                                                                              |
| Groupable        | Yes → RG-AUTH-SHELL-RESIDUAL                                                                                                                                                                                                                                                                                   |

---

## RCA-06 — Support certification residual

| Field            | Value                                                                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Failures         | QA2-F-009…014 (6)                                                                                                                                                                                                                                      |
| Category         | Mocking · Timing · Product defect (a11y)                                                                                                                                                                                                               |
| Root cause       | Post–ENG-0015 Support residual: 403/503 safe-error mapping not asserted in time; keyboard Tab focus; request lifecycle click timeouts; permission/unavailable/cross-tenant error landmarks missing. Mix of mock path timing and possible UI/a11y gaps. |
| Location         | `oss-110-13-*.spec.ts`, `oss-110-14-*.spec.ts`                                                                                                                                                                                                         |
| Owning package   | `apps/web` (Support module)                                                                                                                                                                                                                            |
| Owning product   | APZ Support                                                                                                                                                                                                                                            |
| Platform service | Support                                                                                                                                                                                                                                                |
| Severity         | Medium                                                                                                                                                                                                                                                 |
| Reproducibility  | Medium–High                                                                                                                                                                                                                                            |
| Effort           | M                                                                                                                                                                                                                                                      |
| Groupable        | Yes → RG-SUPPORT-CERT                                                                                                                                                                                                                                  |

---

## RCA-07 — Law search / integration empty results

| Field            | Value                                                                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Failures         | QA2-V-075…081 (**7**)                                                                                                                                           |
| Category         | Integration                                                                                                                                                     |
| Root cause       | Law search/index/palette/matter integration tests return empty results or non-ok provider status — index not populated or provider stub incomplete in test env. |
| Location         | Law search / integration Vitest suites                                                                                                                          |
| Owning package   | `apps/law-platform` / search packages                                                                                                                           |
| Owning product   | APZ Law                                                                                                                                                         |
| Platform service | Search / Law                                                                                                                                                    |
| Severity         | Medium                                                                                                                                                          |
| Reproducibility  | High                                                                                                                                                            |
| Effort           | M                                                                                                                                                               |
| Groupable        | Yes → RG-LAW-SEARCH-INT                                                                                                                                         |

---

## RCA-08 — Observe workbench journey

| Field            | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| Failures         | QA2-F-001 (1)                                                            |
| Category         | Timing / Race · Mocking                                                  |
| Root cause       | `apzobserve-004` manifest journey locator timeout under full-suite load. |
| Location         | `apzobserve-004-observe-workbench.spec.ts`                               |
| Owning package   | `apps/web` observe                                                       |
| Owning product   | Platform Observe                                                         |
| Platform service | Observe                                                                  |
| Severity         | Medium                                                                   |
| Reproducibility  | Medium                                                                   |
| Effort           | S–M                                                                      |
| Groupable        | Yes → RG-OBSERVE-WB                                                      |

---

## RCA-09 — Support inbox visual baseline

| Field            | Value                                                                              |
| ---------------- | ---------------------------------------------------------------------------------- |
| Failures         | QA2-F-015 (1)                                                                      |
| Category         | Visual baseline                                                                    |
| Root cause       | Inbox screenshot still drifts after ENG-0015 refreshed detail/analytics baselines. |
| Location         | Playwright snapshot `support-inbox-chromium-linux.png`                             |
| Owning package   | testing/playwright                                                                 |
| Owning product   | APZ Support                                                                        |
| Platform service | Support                                                                            |
| Severity         | Low                                                                                |
| Reproducibility  | High                                                                               |
| Effort           | S                                                                                  |
| Groupable        | Yes → RG-VISUAL-INBOX                                                              |

---

## RCA-10 — Testing architecture CI SDK boundary

| Field            | Value                                                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Failures         | QA2-V-082 (1)                                                                                                                                         |
| Category         | Product defect (architecture boundary)                                                                                                                |
| Root cause       | `testing-architecture-boundary.test.ts` detects forbidden CI provider SDK/HTTP imports in Testing services layer (layering violation per foundation). |
| Location         | Testing architecture boundary test + offending import sites                                                                                           |
| Owning package   | Testing services / CI-related packages                                                                                                                |
| Owning product   | Platform Testing                                                                                                                                      |
| Platform service | Testing                                                                                                                                               |
| Severity         | Medium                                                                                                                                                |
| Reproducibility  | High                                                                                                                                                  |
| Effort           | M                                                                                                                                                     |
| Groupable        | Yes → RG-TESTING-ARCH                                                                                                                                 |

---

## Root-cause count

| #   | Theme                    | Failures (approx) |
| --- | ------------------------ | ----------------: |
| 1   | Law suite scope          |              7 PW |
| 2   | Cert pin drift           |     **50** Vitest |
| 3   | Law host quality         |     1 lint + 1 TS |
| 4   | Law API authz            |     **24** Vitest |
| 5   | Auth/shell residual      |   4 PW + 30 flaky |
| 6   | Support cert             |              6 PW |
| 7   | Law search int           |      **7** Vitest |
| 8   | Observe WB               |              1 PW |
| 9   | Visual inbox             |              1 PW |
| 10  | Testing arch             |          1 Vitest |
|     | **Distinct root causes** |            **10** |
|     | **Remediation groups**   |            **10** |
