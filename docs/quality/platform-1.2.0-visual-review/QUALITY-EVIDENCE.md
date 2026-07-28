# APZHUB-QA-CERT-004 — Quality Evidence

> **Programme:** APZHUB-QA-CERT-004  
> **Date:** 2026-07-21

---

## Commands

| Step                      | Command                                                                                                                                                                              | Result                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Update analytics baseline | `CI=true pnpm exec playwright test --config testing/playwright/playwright.config.ts --update-snapshots=changed --retries=0 testing/playwright/e2e/oss-110-14-support-visual.spec.ts` | **3/3 PASS** (analytics baseline regenerated) |
| Verify visual suite       | Same config, `--retries=1`, no update                                                                                                                                                | **3/3 PASS**                                  |

## Logs

| Log                     | Path                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Snapshot update         | `/tmp/qa-cert-004/pw-update.log`                                                                                                                            |
| Verification            | `/tmp/qa-cert-004/pw-verify.log`                                                                                                                            |
| Programme evidence JSON | [20260721T194900Z-APZHUB-QA-CERT-004-VISUAL-REVIEW.json](../../operations/evidence/portfolio-recert/20260721T194900Z-APZHUB-QA-CERT-004-VISUAL-REVIEW.json) |

## Source control impact

| Path                                     | Change                                                             |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `…/support-analytics-chromium-linux.png` | Replaced incorrect Home placeholder with Support Analytics capture |
| Application / packages / apps source     | **None**                                                           |
