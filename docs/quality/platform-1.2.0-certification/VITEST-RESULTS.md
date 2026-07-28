# APZHUB-QA-CERT-003 — Vitest Results

> **Programme:** APZHUB-QA-CERT-003  
> **Command:** `pnpm test` (`vitest run`)  
> **Date:** 2026-07-21  
> **Duration:** ~314s  
> **Log:** `/tmp/qa-cert-003/vitest.log`

---

## Summary

| Metric        |          Count |
| ------------- | -------------: |
| Test files    | **885** passed |
| Tests passed  |       **5013** |
| Tests failed  |          **0** |
| Tests skipped |         **66** |
| Exit code     |          **0** |

**Verdict:** **PASS**

## Integration coverage note

Repository root has **no** `pnpm test:integration` script. Prior certification programmes treat `pnpm test` as the unit + integration gate. Integration-marked Vitest files (e.g. `*.integration.test.ts`) executed within this run; several remain skipped when optional infrastructure is absent (counted in the 66 skipped).

## Failures

**None.**
