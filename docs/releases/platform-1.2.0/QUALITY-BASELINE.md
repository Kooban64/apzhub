# Quality Baseline — Platform 1.2.0

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-22  
> **Authoritative runs:** QA-CERT-003 · QA-CERT-004

## Gate results (CERT-003)

| Gate                       | Result                                                     | Evidence                                    |
| -------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| Lint                       | **PASS**                                                   | CERT-003                                    |
| TypeScript                 | **PASS**                                                   | CERT-003                                    |
| Vitest                     | **PASS** — 5013 passed · 66 skipped · 0 failed · 885 files | CERT-003                                    |
| OpenAPI Platform           | **PASS**                                                   | `openapi:validate:platform`                 |
| OpenAPI Law                | **PASS**                                                   | `openapi:validate`                          |
| Portfolio path             | **PASS**                                                   | `20260721T192226Z-R12-QA-01-path-PASS.json` |
| Portfolio Playwright full  | 119 pass · **1** hard · **6** flaky                        | `20260721T193400Z-R12-QA-01-full-FAIL.json` |
| Architecture verification  | **PASS**                                                   | CERT-003                                    |
| Compatibility verification | **PASS**                                                   | CERT-003                                    |

## Visual residual closure (CERT-004)

| Item                | Result                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------- |
| Hard failure        | Support Analytics snapshot — classified **incorrect baseline** (not product regression) |
| Baseline update     | `support-analytics-chromium-linux.png` → 1280×1064                                      |
| Visual suite verify | **3/3 PASS**                                                                            |
| Owner Decision      | CERT-004 **ACCEPTED**                                                                   |

## Flaky residual (non-blocking after retry)

Six CERT-003 flaky cases (notifications, TCMS, Support Soft performance) passed on retry. Recommendations only — no remediation under freeze. See CERT-004 [ROOT-CAUSE.md](../../quality/platform-1.2.0-visual-review/ROOT-CAUSE.md).

## Quality freeze statement

This quality evidence set is the certification baseline for Platform **1.2.0**. No quality remediation is authorised under this programme.
