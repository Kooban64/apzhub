# OSS-110-12 Test Summary

**Milestone:** OSS-110-12 — Support Vertical Slice Certification & Closeout  
**Date:** 2026-07-11  
**Overall result:** ✅ PASS

---

## Test counts (verified 2026-07-11)

| Suite | Tests | Result |
|-------|-------|--------|
| `platform-api.support.v1.test.ts` | 48 | ✅ PASS |
| `support-platform-services.test.ts` | 20 | ✅ PASS |
| `support-vertical-stack.e2e.test.ts` | 17 | ✅ PASS |
| `support-vertical-certification.test.ts` | 59 | ✅ PASS |
| `support-vertical-performance.baseline.test.ts` | 2 | ✅ PASS |
| **Total** | **146** | **✅ PASS** |

---

## Test suites

### 1. `apps/web/lib/api/v1/platform-api.support.v1.test.ts`

**Scope:** HTTP API unit/integration tests (OSS-110-11)  
**Lines:** 897  
**Tests:** 48  
**Key coverage:**

- Support Requests CRUD (list, create, get, update, close, reopen)
- State, priority, assignment commands
- Articles — note/reply visibility enforcement
- Organizations CRUD + cross-tenant denial
- Groups CRUD
- Users — list/lookup/search + cross-tenant
- Support Search (q/query alias, kind validation)
- Support History
- Support Analytics
- Validation (strict schemas, path params)
- Authorization and tenancy
- Provider/system errors (409, 503, 501)
- OpenAPI + architecture boundary (no Zammad imports in handlers/routes)

---

### 2. `packages/platform-services/src/support-platform-services.test.ts`

**Scope:** Platform service layer tests (OSS-110-11)  
**Lines:** 925  
**Key coverage:**

- Package version `0.7.0`
- Support mapping global IDs (`sreq_`, provisional `sreq_zammad_*`)
- Zammad support capability provider delegation
- Provider resolution (priority, mapping hints)
- Gateway exposure (`PROVIDER_CAPABILITY_UNSUPPORTED` without provider)
- `SupportServiceImpl` mapping (list, get, create, update, close, reopen, assign)
- Related domain services (orgs, groups, users, articles, search, history, analytics)
- Request pipeline execution
- Authorization (`support.*` permissions, `resolveOperationAuthorization`)
- Provider failure translation

---

### 3. `testing/support-vertical/support-vertical-stack.e2e.test.ts`

**Scope:** Full mocked E2E stack — HTTP → Gateway → Services → Providers → Adapter (OSS-110-12)  
**Tests:** 12

| Test | Description |
|------|-------------|
| verifies platform versions | ZAMMAD_ADAPTER_VERSION = 0.6.0, PLATFORM_SERVICES_VERSION = 0.7.0 |
| support request list/get/create | Platform IDs, no sreq_zammad_ leakage |
| state transitions | close/reopen/state/priority/owner/customer |
| articles | list/get/createNote/createReply with visibility enforcement |
| history | getTimeline returns ticket ID |
| organizations CRUD+archive | sorg_ platform IDs |
| groups list/create/update | sgrp_ platform IDs |
| users list/get | suser_ platform IDs |
| search | q parameter, hits array |
| analytics | totalTickets, openTickets, closedTickets |
| error: invalid ID | Throws validation error |
| error: wrong prefix | Throws validation error |
| cross-tenant | Tenant B cannot resolve Tenant A IDs |
| mapping store | Platform IDs without zammad marker |
| adapter health/readiness | zammad_api check passes |
| gateway-only E2E | Full path without HTTP |
| capability registration | All 8 support services registered |

---

### 4. `testing/support-vertical/support-vertical-certification.test.ts`

**Scope:** Certification assertions (OSS-110-12)  
**Tests:** 35+

| Section | Tests |
|---------|-------|
| A — Package versions | 2 |
| B — Architecture boundary (HTTP layer) | 5 |
| C — OpenAPI specification | 4 |
| D — Permission catalogue | 23 |
| E — Operation authorization mappings | 12 |
| F — Capability registration | 2 |
| G — Out-of-scope features absent | 6 |
| H — Known limitations documented | 4 |

---

### 5. `testing/support-vertical/support-vertical-performance.baseline.test.ts`

**Scope:** Performance measurement (OSS-110-12)  
**Tests:** 2

- HTTP-layer baselines (9 operations, all < 5,000 ms)
- Gateway-layer baselines (8 operations, all < 5,000 ms)

---

## Dependency audit

**Script:** `scripts/support-vertical-dependency-audit.mjs`  
**Output:** `docs/sprint/OSS-110-12-dependency-audit.md`  
**Result:** PASS (0 violations)

---

## OpenAPI validation

**Command:** `pnpm openapi:validate:platform`  
**Target:** `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`  
**Result:** ✅ Valid
