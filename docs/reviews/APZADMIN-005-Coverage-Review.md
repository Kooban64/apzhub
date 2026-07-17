# APZADMIN-005 — Coverage Review

**Date:** 2026-07-16  
**Baseline:** [APZADMIN-005-Coverage-Baseline.md](./APZADMIN-005-Coverage-Baseline.md)

## Consolidated measurement

| Metric | Value |
| --- | --- |
| Lines | **99.37%** |
| Functions | **99.43%** |
| Branches | **82.75%** |

## Layer notes

| Layer | Notes |
| --- | --- |
| HTTP handlers | **99.44%** lines / **100%** functions |
| Typed client | **99%+** lines; types-only module contributes 0 executable stmts |
| Contracts / core | **100%** lines/functions |
| Persistence | High lines; Postgres repository branch edges remain |
| Workbench | **99.39%** lines from APZADMIN-004; secondary empty/error paths remain |
| Vertical harness | Certification-only assertions (no product features) |

## Verdict

**PASS** — lines/functions exceed the aspirational 95% bar. Branch coverage at **82.75%** and intentional product exclusions (runtime/identity/provision) support classification **PRODUCTION_READY_WITH_LIMITATIONS**.
