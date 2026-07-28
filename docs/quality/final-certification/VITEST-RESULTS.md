# APZHUB-QA-CERT-002 — Vitest Results

> **Programme:** APZHUB-QA-CERT-002  
> **Command:** `pnpm test` (`vitest run`)  
> **Date:** 2026-07-21  
> **Duration:** ~327s

---

## Summary

| Metric            |    Count |
| ----------------- | -------: |
| Test files passed |  **884** |
| Test files failed |    **1** |
| Tests passed      | **5011** |
| Tests failed      |    **1** |
| Tests skipped     |   **66** |
| Total tests       | **5078** |

**Verdict:** **FAIL** (exit 1)

---

## Comparison to QA-CERT-001

| Metric       | QA-CERT-001 | QA-CERT-002 |
| ------------ | ----------: | ----------: |
| Failed tests |          82 |       **1** |
| Passed tests |        4929 |    **5011** |
| Files        |         885 |         885 |

---

## Hard failure (1)

| Suite                                                  | Case                                  | Observation                                       |
| ------------------------------------------------------ | ------------------------------------- | ------------------------------------------------- |
| `integrations/zammad/src/zammad-core-services.test.ts` | exposes core services on adapter.core | Expected capability count **12**, received **11** |

No source code was modified under this programme.
