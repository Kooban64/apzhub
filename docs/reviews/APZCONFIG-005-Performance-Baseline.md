# APZCONFIG-005 — Performance Baseline

**Date:** 2026-07-16

## Scope

Metadata management plane only — no runtime resolution hot path.

## Observations

| Area | Baseline |
| --- | --- |
| HTTP handlers | Thin gateway orchestration; no business rules in presentation |
| Typed client | Single HTTP round-trip per operation; AbortSignal supported |
| Workbench | TanStack Query caching with controlled invalidation after mutations |
| Persistence | PostgreSQL SoR; in-memory factory for unit tests only |

## Limitations

- No performance budget for runtime apply (feature absent)
- No load-test suite in this certification (metadata CRUD volumes expected to be modest)
- Live Playwright webServer may be blocked by unrelated Next.js Testing slug conflict

## Verdict

**ACCEPTABLE** for metadata management plane with documented limitations.
