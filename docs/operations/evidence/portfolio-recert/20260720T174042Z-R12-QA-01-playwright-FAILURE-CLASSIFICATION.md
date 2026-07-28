# R12-QA-01 Playwright failure classification

> **Evidence:** [20260720T174042Z-R12-QA-01-playwright-FAIL.json](./20260720T174042Z-R12-QA-01-playwright-FAIL.json)  
> **Environment:** host `dev` · Playwright webServer (Next.js) · APZHUB Compose healthy separately (`docker` mode PASS)  
> **Suite result:** **55 failed** · **1 flaky** · **77 passed** · ~36.9m · exit **1**

---

## Classification rule

| Class              | Meaning                                                                  |
| ------------------ | ------------------------------------------------------------------------ |
| **environment**    | Host/runtime/auth/seed/infra instability — not a product redesign signal |
| **product_defect** | Spec expectation mismatch against current product behaviour              |
| **docs_gap**       | Coverage or runbook gap (not used this run)                              |

R12-QA-01 delivers the **re-cert path**. Suite greenness is **not** claimed. Failures below are residual honesty for PL12-KL-06 narrowing — **not** in-scope product fixes under ENG-0005.

---

## Aggregates

| Class              | Approx. share                                                                    | Notes                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **environment**    | Dominant (SPR shell, Law trust, Support a11y/visual, many workbench navigations) | Better Auth `Invalid password` warnings; Next.js `Error: aborted` / JSON parse noise; login/shell timeouts         |
| **product_defect** | Minority (mocked typed-client absolute URL parse)                                | e.g. `Failed to parse URL from /api/v1/administration/modules` and similar relative `fetch` in page.evaluate mocks |
| **docs_gap**       | None identified this run                                                         | Path/runbook present                                                                                               |

---

## Spec clusters (failed)

| Cluster                     | Specs                                                                 | Class                                          |
| --------------------------- | --------------------------------------------------------------------- | ---------------------------------------------- |
| Platform shell SPR-001…007  | `spr-001` … `spr-007-*`                                               | environment (auth/shell hydration)             |
| Law trust                   | `law-015-trust-workflow` (7)                                          | environment (seeded trust + auth)              |
| Support a11y/visual         | `oss-110-14-support-*`                                                | environment                                    |
| Typed HTTP clients (mocked) | `apzadmin-003`, `apzidentity-003`, `apzmetrics-003`, `apzobserve-003` | product_defect (relative URL in evaluate)      |
| Workbench journeys          | docs/search/report/tcms/workflow/metrics/observe                      | mixed — mostly environment timeouts/visibility |
| Accessibility login axe     | `accessibility` login page                                            | environment / a11y residual                    |

---

## Honesty statement

- **Path stage:** PASS (artefacts + CI wiring + runbook).
- **Docker stage:** PASS (compose config + APZHUB services healthy).
- **Playwright stage:** executed; verdict **FAIL** — residual suite debt, not missing path.
- No Platform **1.2.0** packaging mutation. No product redesign under this programme.
