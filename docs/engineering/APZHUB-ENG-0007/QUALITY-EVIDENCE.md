# APZHUB-ENG-0007 — Quality Evidence

> **Programme:** APZHUB-ENG-0007  
> **Date:** 2026-07-21  
> **Scope:** RG-LAW-DNS only

---

## Commands executed

| Gate              | Command                                                                                                        | Result                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Unit (scoped)     | Vitest: persistence foundation/hardening, create-app-action-executor, trust dashboard + router, web-server-env | **18 PASS**                                         |
| Build             | `pnpm --filter @apzhub/law-platform build`                                                                     | **PASS** (client graph compiles without `pg`/`dns`) |
| Architecture      | No Module→Connector bypass; `pg` kept off client import path                                                   | **PASS**                                            |
| Compatibility     | Platform 1.2.0 packaging unchanged                                                                             | **PASS**                                            |
| Scoped Playwright | `law-015-trust-workflow` via `playwright.law.config.ts`                                                        | **7 passed** (~59s)                                 |

### Scoped Playwright command

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.law.config.ts \
  --retries=0
```

---

## RG-LAW-DNS Playwright results

| Test                                                                               | Before             | After    |
| ---------------------------------------------------------------------------------- | ------------------ | -------- |
| navigates to trust via Law Platform workspace and sidebar                          | FAIL (dns overlay) | **PASS** |
| renders trust dashboard metrics and diagnostics from seeded workbench data         | FAIL (dns overlay) | **PASS** |
| walks all trust sub-routes and renders page shells with tables                     | FAIL (dns overlay) | **PASS** |
| displays seeded transactions, allocations, reconciliation, interest, and transfers | FAIL (dns overlay) | **PASS** |
| generates a trust report and enables export actions                                | FAIL (dns overlay) | **PASS** |
| opens print view in a new tab after generating a report                            | FAIL (dns overlay) | **PASS** |
| trust diagnostics counters reflect seeded engine activity                          | FAIL (dns overlay) | **PASS** |

**Remaining RG-LAW-DNS failures:** **0**  
**Remaining flaky (this scoped run):** **0**

Evidence JSON: [20260721T023130Z-APZHUB-ENG-0007-RG-LAW-DNS.json](../../operations/evidence/portfolio-recert/20260721T023130Z-APZHUB-ENG-0007-RG-LAW-DNS.json)

### Notes

- Pre-existing `apps/law-platform` typecheck noise in `r12-persist-02-boundary.test.ts` (Vitest mock tuple typing) is unrelated and was not modified.
- Lint/root typecheck not expanded beyond Law-scoped verification for this remediation train.
