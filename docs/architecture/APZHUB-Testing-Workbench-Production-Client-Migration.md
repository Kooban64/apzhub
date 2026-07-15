# APZHUB Testing Workbench Production Client Migration

**Purpose:** Record the APZTCMS-012 migration from mock-only workbench data to production HTTP transport.  
**Audience:** Frontend engineers, QA, AI agents.  
**Authority:** [APZ TCMS Testing Workbench Architecture](./APZHUB-APZ-TCMS-Testing-Workbench-Architecture.md) · [Testing Typed Client Architecture](./APZHUB-Testing-Typed-Client-Architecture.md)  
**Status:** Implemented — APZTCMS-012 complete.  
**Last updated:** 2026-07-12

---

## Migration Result

The Testing workbench now uses the HTTP client by default outside test runs. No view component was rewired to route handlers or platform services directly; the existing `TestingClient` boundary stayed intact.

```text
Testing views → testing-api.ts → TestingClient
  → createHttpTestingClient() → /api/v1/testing/**
```

Unit and component tests still default to the mock client for speed and determinism.

---

## Production Behavior

- Plans, suites, cases, requirements, executions, evidence, automation imports, coverage, defects, quality, certification, and dashboard screens load through `/api/v1/testing/**`.
- Empty/deferred surfaces such as reports and some release readiness lists remain client-level placeholders where no collection endpoint exists.
- Playwright uses mocked `/api/v1/testing/**` routes; it does not require live runners or production Testing services.

---

## Rollback

Tests can call `setTestingClient(createMockTestingClient())` or `resetTestingClient()`. Production code should not force the mock client outside `NODE_ENV=test`.
