# APZHUB-QA-CERT-002 — Quality Summary

> **Programme:** APZHUB-QA-CERT-002  
> **Date:** 2026-07-21

---

## Lint

**FAIL** — `scripts/apzworkflow-001-workflow-foundation-audit.mjs` lines 92:66 and 92:80 — `no-useless-escape` (2 errors).

## Typecheck

**PASS** — `pnpm typecheck` exit 0 across the monorepo (including `apps/web`, `apps/law-platform`, platform-services, integrations).

## Unit / Integration / Regression (Vitest)

**FAIL** — **1 failed** · **5011 passed** · **66 skipped** (885 files, ~327s).

Single failure: Zammad `adapter.core.discoverCapabilities().length` expected 12, received 11.

## Architecture

**PASS** for this programme — certification-only; Wave 2 remediation groups complete; path recert artefacts present; no authorised engineering mutation.

## Compatibility

**PASS** for this programme — Platform **1.2.0** packaging and public API surfaces not changed by QA-CERT-002.

## Playwright portfolio

**FAIL** — 115 passed · 10 failed · 1 flaky · ~15.2m.

---

## Bottom line

| Dimension                          | Status                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| Engineering Wave 2 closure         | **Complete** (ENG-0016…0021; no OPEN repository-approved remediation groups) |
| Full portfolio green certification | **Not achieved**                                                             |
| Recommendation                     | **CERTIFICATION FAILED**                                                     |
