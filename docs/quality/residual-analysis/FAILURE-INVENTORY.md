# Residual Failure Inventory

> **Programme:** APZHUB-QA-RECERT-002  
> **Baseline:** Platform **1.2.0**  
> **Source:** APZHUB-QA-CERT-001  
> **Authority:** Analysis only

Every residual failure has exactly one remediation group.

---

## Playwright hard failures (19)

| ID            | Spec / case                                           | Category                            | Root cause (summary)                                                                                                                    | Location                                                          | Package                           | Product          | Service    | Sev | Repro | Effort | Group                                                           |
| ------------- | ----------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------- | ---------------- | ---------- | --- | ----- | ------ | --------------------------------------------------------------- |
| QA2-F-001     | apzobserve-004 · manifest journey                     | Timing / Race · Mocking             | Observe workbench journey locator timeout under suite load                                                                              | `testing/playwright/e2e/apzobserve-004-observe-workbench.spec.ts` | apps/web observe                  | Platform Observe | Observe    | M   | High  | M      | RG-OBSERVE-WB · **REMEDIATED** (ENG-0020)                       |
| QA2-F-002…008 | law-015 · 7 Trust cases                               | Test infrastructure · Configuration | Law Trust suite executed under **main** `test:e2e` (web :3300) while helpers target Law origin **:3302** → Better Auth `Invalid origin` | `law-015-trust-workflow.spec.ts` + `law-auth-helpers.ts`          | testing/playwright · law-platform | APZ Law          | Law Trust  | H   | High  | S      | RG-LAW-SUITE-SCOPE · **REMEDIATED** (ENG-0016)                  |
| QA2-F-009     | oss-110-13 · maps 403/503                             | Mocking · Timing                    | Support safe-error UI not visible in time / mock path                                                                                   | `oss-110-13-support-module.spec.ts`                               | apps/web support                  | APZ Support      | Support    | M   | Med   | M      | RG-SUPPORT-CERT · **REMEDIATED** (ENG-0020)                     |
| QA2-F-010     | oss-110-14 a11y · keyboard Tab                        | Timing · Product defect             | Tab order / focus target assertion fails                                                                                                | `oss-110-14-support-accessibility.spec.ts`                        | apps/web support                  | APZ Support      | Support    | M   | Med   | M      | RG-SUPPORT-CERT · **REMEDIATED** (ENG-0020)                     |
| QA2-F-011     | oss-110-14 cert · open request lifecycle              | Timing · Mocking                    | Click timeout on request actions                                                                                                        | `oss-110-14-support-ui-certification.spec.ts`                     | apps/web support                  | APZ Support      | Support    | M   | Med   | M      | RG-SUPPORT-CERT · **REMEDIATED** (ENG-0020)                     |
| QA2-F-012…014 | oss-110-14 cert · permission/unavailable/cross-tenant | Mocking                             | Expected `support-error` landmarks not visible                                                                                          | same                                                              | apps/web support                  | APZ Support      | Support    | M   | Med   | M      | RG-SUPPORT-CERT · **REMEDIATED** (ENG-0020)                     |
| QA2-F-015     | oss-110-14 visual · **inbox** screenshot              | Visual baseline                     | Inbox baseline drift (detail/analytics already refreshed ENG-0015)                                                                      | `*-snapshots/support-inbox-chromium-linux.png`                    | testing/playwright                | APZ Support      | Support    | L   | High  | S      | RG-VISUAL-INBOX · **REMEDIATED** (ENG-0020)                     |
| QA2-F-016…018 | spr-003 context / navigation / session                | Authentication · Timing             | `page.goto: Target page, context or browser has been closed` under auth instability                                                     | `spr-003-*.spec.ts`                                               | apps/web shell                    | Platform         | Auth/Shell | H   | High  | L      | RG-AUTH-SHELL-RESIDUAL · **REMEDIATED** (ENG-0019 **ACCEPTED**) |
| QA2-F-019     | spr-005 · palette knowledge navigation                | Authentication · Timing             | Browser closed during navigation                                                                                                        | `spr-005-knowledge-discovery-framework.spec.ts`                   | apps/web shell                    | Platform         | Knowledge  | H   | High  | L      | RG-AUTH-SHELL-RESIDUAL · **REMEDIATED** (ENG-0019 **ACCEPTED**) |

---

## Playwright flaky (30) — inventory class

| ID range       | Theme                                                                                    | Category                       | Group                                                           |
| -------------- | ---------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------- |
| QA2-FL-001…030 | spr-001/003–007 auth/shell hydration; selected workbench/mocked HTTP first-attempt fails | Authentication · Timing / Race | RG-AUTH-SHELL-RESIDUAL · **REMEDIATED** (ENG-0019 **ACCEPTED**) |

Representative: accessibility shell axe, config/workflow/metrics/notify/observe/TCMS EI, Support performance + orgs list, SPR registration/theme/sign-out, Action/Knowledge/Notification/Activity framework suites.

---

## Lint (1)

| ID        | Failure                                  | Category | Location                                                     | Group                                           |
| --------- | ---------------------------------------- | -------- | ------------------------------------------------------------ | ----------------------------------------------- |
| QA2-L-001 | unused `setSessionLawPersistenceContext` | Lint     | `apps/law-platform/lib/persistence/law-persistence-scope.ts` | RG-LAW-HOST-QUALITY · **REMEDIATED** (ENG-0016) |

---

## TypeScript (1)

| ID        | Failure                             | Category           | Location                                                            | Group                                           |
| --------- | ----------------------------------- | ------------------ | ------------------------------------------------------------------- | ----------------------------------------------- |
| QA2-T-001 | TS2493 tuple index in boundary test | Build / TypeScript | `apps/law-platform/lib/persistence/r12-persist-02-boundary.test.ts` | RG-LAW-HOST-QUALITY · **REMEDIATED** (ENG-0016) |

---

## Vitest (82) — exact class counts

| Class                                        |  Count | Notes                                                         |
| -------------------------------------------- | -----: | ------------------------------------------------------------- |
| **Unit**                                     | **28** | Law API authz **24** + OpenAPI pin **3** + Testing arch **1** |
| **Integration**                              |  **7** | Law search/palette/workflow/matter/tenant                     |
| **Regression** (certification / wave freeze) | **47** | Vertical certification + wave closeout SemVer pins            |

### Grouped inventory

| ID range      |  Count | Category                 | Root cause                                                                                                                           | Group                                                    |
| ------------- | -----: | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| QA2-V-001…047 | **47** | Regression · Test defect | Frozen certification / foundation tests pin old SemVer (`platform-services` **0.26.1** vs live, zammad **0.6.0** vs **0.8.0**, etc.) | RG-CERT-PIN-DRIFT · **REMEDIATED** (ENG-0017)            |
| QA2-V-048…050 |  **3** | Unit · Test defect       | Handler tests whitelist OpenAPI ≤1.10.0 but catalogue is **1.12.0**                                                                  | RG-CERT-PIN-DRIFT · **REMEDIATED** (ENG-0017)            |
| QA2-V-051…074 | **24** | Unit · Authentication    | Law API permission fixtures inverted (403↔2xx) + cascade TypeErrors                                                                  | RG-LAW-API-AUTHZ · **REMEDIATED** (ENG-0018)             |
| QA2-V-075…081 |  **7** | Integration              | Law search/palette/workflow/matter empty / non-ok provider                                                                           | RG-LAW-SEARCH-INT · **REMEDIATED** (ENG-0018)            |
| QA2-V-082     |  **1** | Unit · Product defect    | Testing architecture boundary — forbidden CI SDK/HTTP imports                                                                        | RG-TESTING-ARCH · **REMEDIATED** (ENG-0021 **ACCEPTED**) |

Exact per-file mapping: Vitest FAIL list in `/tmp/qa-cert-001/vitest.log` (40 failing files · 82 tests).

---

## Totals

| Class                                                 |   Count |
| ----------------------------------------------------- | ------: |
| Playwright hard                                       |      19 |
| Playwright flaky                                      |      30 |
| Lint                                                  |       1 |
| TypeScript                                            |       1 |
| Vitest (all)                                          |      82 |
| — Unit                                                |      28 |
| — Integration                                         |       7 |
| — Regression                                          |      47 |
| **Surface fails (hard+gates+vitest; flaky separate)** | **103** |
