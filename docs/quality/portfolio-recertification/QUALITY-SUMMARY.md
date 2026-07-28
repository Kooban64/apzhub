# APZHUB-QA-CERT-001 — Quality Summary

> **Programme:** APZHUB-QA-CERT-001  
> **Date:** 2026-07-21

---

## Lint

**FAIL** — `apps/law-platform/lib/persistence/law-persistence-scope.ts` unused `setSessionLawPersistenceContext` (`@typescript-eslint/no-unused-vars`).

## Typecheck

**FAIL** — `@apzhub/law-platform` `tsc --noEmit`: `lib/persistence/r12-persist-02-boundary.test.ts` TS2493 tuple index error.

## Unit / Integration / Regression (Vitest)

**FAIL** — **82 failed** · **4929 passed** · **66 skipped** (885 files, ~313s).

Notable clusters (non-exhaustive): Law API permission expectations (403 vs 200), Law search/workflow integration, OpenAPI version expectation drift (tests expect ≤1.10.0 while OpenAPI reports **1.12.0**), workflow certification package version pin, testing architecture boundary CI/CD import check.

## Architecture

**PASS** for this programme — certification-only; path recert artefacts present; no authorised engineering mutation.

## Compatibility

**PASS** for this programme — Platform **1.2.0** packaging and public API surfaces not changed by QA-CERT-001.

## Playwright portfolio

**FAIL** — 84 passed · 19 failed · 30 flaky · ~53.8m.

---

## Bottom line

| Dimension                          | Status                                   |
| ---------------------------------- | ---------------------------------------- |
| Remediation engineering closure    | **Complete** (no OPEN Orders 1–6 groups) |
| Full portfolio green certification | **Not achieved**                         |
| Recommendation                     | **CERTIFICATION FAILED**                 |
