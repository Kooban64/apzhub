# APZHUB Platform — Testing Review

> **Milestone:** M16 — Platform Stabilisation & Engineering Review  
> **Date:** 2026-07-08  
> **Type:** Analysis only

---

## 1. Purpose

Review unit, integration, E2E, coverage, contract testing, and CI readiness.

---

## 2. Test inventory

| Layer            | Files         | Tests (approx.)    | Status      |
| ---------------- | ------------- | ------------------ | ----------- |
| Unit (Vitest)    | 370           | 1846 pass, 44 skip | ✅ Strong   |
| Integration      | ~30           | Included in Vitest | ✅ Good     |
| E2E (Playwright) | 12 specs      | ~49 test cases     | ⚠️ Env gaps |
| Storybook        | UI package    | Component stories  | ✅ Present  |
| Contract (API)   | law-api tests | Per-resource       | ✅ Good     |

---

## 3. Unit tests

### Strengths

- 370 test files across packages and apps
- Per-package coverage thresholds in `vitest.config.ts` (80% global; 85–100% runtime subsystems)
- Trust subsystem: 118+ dedicated tests
- Framework packages: 21–40 test files each

### Weaknesses

- `packages/config/src/db/**` excluded from coverage
- Auth server paths excluded
- Some postgres integration tests skipped without `DATABASE_URL`

### Package distribution

| Package                       | Test files |
| ----------------------------- | ---------- |
| workspace                     | 32         |
| platform-runtime              | 40         |
| knowledge-discovery-framework | 30         |
| command-framework             | 29         |
| activity-timeline-framework   | 29         |
| workbench-framework           | 30         |
| event-notification-framework  | 21         |
| law-platform (app)            | 112        |
| web (app)                     | 26         |

**Rating: Excellent**

---

## 4. Integration tests

### Strengths

- Law workflow integration tests per domain (`client-workflow.integration.test.ts`, etc.)
- Trust API workflow validation chains full REST journey
- Postgres repository integration tests (conditional)
- Action audit → notification pipeline test
- Platform asset bootstrap integration test

### Weaknesses

- RLS cross-tenant test deferred (TD-P10)
- Outbox worker untested (not implemented)
- No full API → postgres → outbox E2E chain

**Rating: Very Good**

---

## 5. Playwright E2E

### Configs

| Config                     | Target                 | Port |
| -------------------------- | ---------------------- | ---- |
| `playwright.config.ts`     | `@apzhub/web`          | 3300 |
| `playwright.law.config.ts` | `@apzhub/law-platform` | 3302 |

### Spec coverage

| Spec                                            | Milestone |
| ----------------------------------------------- | --------- |
| `spr-001.spec.ts`                               | M1        |
| `spr-002-runtime.spec.ts`                       | M2        |
| `spr-003-workbench-*.spec.ts`                   | M3        |
| `spr-004-action-framework.spec.ts`              | M4        |
| `spr-005-knowledge-discovery-framework.spec.ts` | M5        |
| `spr-006-event-notification-framework.spec.ts`  | M6        |
| `spr-007-activity-timeline-framework.spec.ts`   | M7        |
| `law-api-developer-experience.spec.ts`          | LAW-014   |
| `law-015-trust-workflow.spec.ts`                | LAW-015   |
| `accessibility.spec.ts`                         | a11y      |

### Weaknesses

- Chromium unavailable in some CI environments (documented since LAW-012-08)
- Trust E2E spec delivered but not green in law-platform env (LAW-015-13)
- E2E hooks (`__APZHUB_E2E__`, `?paletteMode=knowledge`) are test-only shortcuts

**Rating: Good** (Strong design, execution gaps)

---

## 6. Coverage

| Metric     | Threshold | Current (M16) |
| ---------- | --------- | ------------- |
| Lines      | 80%       | **90.24%**    |
| Functions  | 80%       | **90.48%**    |
| Branches   | 80%       | **87.12%**    |
| Statements | 80%       | **90.24%**    |

### Exclusions (intentional)

- `packages/config/src/db/**`
- Auth server/client entry points
- Bootstrap engines
- Index re-export files

**Rating: Excellent**

---

## 7. Contract testing

| Contract                      | Status                                       |
| ----------------------------- | -------------------------------------------- |
| API envelope shape            | ✅ `framework.test.ts`                       |
| Law API auth                  | ✅ `law-api-auth.test.ts`                    |
| Trust API                     | ✅ `trust-api.test.ts` + workflow validation |
| OpenAPI spec                  | ⚠️ Partial — trust paths incomplete          |
| Repository parity             | ✅ `trust-repository-parity.test.ts`         |
| Writable repository contracts | ✅ Per-domain contract tests                 |

**Recommendation:** Add Spectral OpenAPI lint in CI; pact-style consumer tests for external integrators (M9+).

**Rating: Good**

---

## 8. Repository parity testing

### Strengths

- Trust memory/postgres parity tests
- Writable repository contract tests ensure adapter compliance
- `LAW_REPOSITORY_MODE` switch tested

### Weaknesses

- Not all aggregates have parity tests
- Workbench bundle not parity-tested against API bundle

**Rating: Good**

---

## 9. Testing strategy assessment

| Principle (015)    | Status                                  |
| ------------------ | --------------------------------------- |
| Full test pyramid  | ✅ Unit heavy, integration mid, E2E top |
| CI every commit    | ✅ Pre-commit hooks                     |
| No skipping stages | ✅ Phased gates                         |
| Playwright for UX  | ✅ Per milestone                        |
| a11y verification  | ⚠️ Partial (axe on select pages)        |
| Security checks    | ⚠️ No dedicated security test suite     |

---

## 10. CI readiness

| Gate                 | Enforced | Location            |
| -------------------- | -------- | ------------------- |
| `pnpm lint`          | ✅       | pre-commit + manual |
| `pnpm typecheck`     | ✅       | manual              |
| `pnpm build`         | ✅       | manual              |
| `pnpm test`          | ✅       | pre-commit          |
| `pnpm test:coverage` | ✅       | manual              |
| `pnpm test:e2e`      | ⚠️       | Env-dependent       |
| OpenAPI lint         | ❌       | Not in CI           |
| Security scan        | ❌       | Not in CI           |

### Weaknesses

- Pre-commit runs full test suite — slow feedback
- E2E not reliably green in headless CI
- No GitHub Actions workflow observed in M16 review (`.github` scaffold)

**Rating: Good** (gates exist; CI automation incomplete)

---

## 11. Recommendations

| Priority | Recommendation                                      | Milestone  |
| -------- | --------------------------------------------------- | ---------- |
| High     | Fix Playwright CI — install Chromium in runner      | M17        |
| High     | Add GitHub Actions workflow mirroring quality gates | M17        |
| Medium   | Split pre-commit fast/slow                          | M17        |
| Medium   | OpenAPI Spectral gate                               | LAW-015-15 |
| Medium   | RLS cross-tenant integration test                   | M8         |
| Low      | Load test baseline script                           | Pre-pilot  |
| Low      | a11y CI for Law workbench routes                    | LAW-016+   |

---

## 12. Verdict

**Testing maturity: VERY GOOD (8.5/10)**

Strong unit coverage and pyramid structure. E2E and CI automation are the primary gaps before commercial confidence.

---

_Related: [Engineering Review](../reviews/APZHUB-Platform-Engineering-Review.md) · [Commercial Readiness](../reviews/APZHUB-Commercial-Readiness-Assessment.md)_
