# APZHUB-QA-CERT-001 — Playwright Results

> **Programme:** APZHUB-QA-CERT-001  
> **Suite:** `pnpm test:e2e` via `ops:portfolio-recert --mode full`  
> **Date:** 2026-07-21  
> **Duration:** ~53.8m

---

## Summary

| Metric                  |  Count |
| ----------------------- | -----: |
| Passed                  | **84** |
| Failed                  | **19** |
| Flaky (passed on retry) | **30** |

**Portfolio full verdict:** **FAIL**  
Evidence: [20260721T120046Z-R12-QA-01-full-FAIL.json](../../operations/evidence/portfolio-recert/20260721T120046Z-R12-QA-01-full-FAIL.json)

---

## Comparison to ENG-0005 baseline (2026-07-20)

| Metric | ENG-0005 | QA-CERT-001 |
| ------ | -------: | ----------: |
| Passed |       77 |      **84** |
| Failed |       55 |      **19** |
| Flaky  |        1 |      **30** |

Remediation programmes ENG-0006…0015 reduced hard failures substantially. Portfolio is **not green**.

---

## Hard failures (19)

1. `apzobserve-004` — manifest journey across overview…diagnostics  
   2–8. `law-015-trust-workflow` — seven Trust Accounting E2E cases (main Playwright config)
2. `oss-110-13` — maps 403 and 503 safely
3. `oss-110-14-support-accessibility` — keyboard Tab reaches meaningful inbox control  
   11–14. `oss-110-14-support-ui-certification` — open request lifecycle + error-mapping cases
4. `oss-110-14-support-visual` — **inbox** screenshot (detail/analytics PASS under ENG-0015)
5. `spr-003-workbench-context-selection` — persisted workbench context
6. `spr-003-workbench-navigation` — sidebar selection activates view/route
7. `spr-003-workbench-session` — restore after reload
8. `spr-005` — palette knowledge mode delegates navigation

---

## Flaky (30)

Primarily SPR shell/auth hydration and workbench framework suites (spr-001/003–007), plus selected workbench/mocked-HTTP specs. Full list in `/tmp/qa-cert-001/portfolio-full.log` and terminal evidence.

---

## Remediated-area smoke (Orders 1–6 members)

Scoped member suites for RG-HEALTH-503…RG-VISUAL were previously **PASS** under ENG-0006…0015. Full portfolio still fails on residual shell/Support/Law/Observe surfaces **outside** the closed remediation-group member sets.
