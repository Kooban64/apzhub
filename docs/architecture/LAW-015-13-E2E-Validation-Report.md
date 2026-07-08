# LAW-015-13 — E2E Validation Report

> Playwright validation of Trust Accounting workbench (LAW-015-13)

---

## Spec

**File:** `testing/playwright/e2e/law-015-trust-workflow.spec.ts`

**Auth:** Dev user (`dev@apzhub.local`) with allow-all permissions in dev mode.

**App:** `@apzhub/law-platform` on port **3301** (Playwright `law-trust` project). The platform `@apzhub/web` app (3300) uses a placeholder workbench without Trust UI.

**Data source:** In-memory trust workbench seeded by `seedTrustWorkbenchData()` on first access — deposits, allocations, reconciliation, interest, transfers, and a pending withdrawal draft.

---

## Test cases

| #   | Test                                                | Validates                                                               |
| --- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | Navigate via Law Platform workspace + Trust sidebar | Manifest-driven navigation                                              |
| 2   | Dashboard metrics and diagnostics                   | `trust-dashboard-page`, metrics, diagnostics panel, recent transactions |
| 3   | All sub-route page shells                           | 8 routes × page testid + sub-nav                                        |
| 4   | Seeded table rows                                   | Transactions, allocations, reconciliation, interest, transfers          |
| 5   | Report generate + export buttons                    | Report type select, generate, CSV/print buttons visible                 |
| 6   | Print view popup                                    | HTML export opens in new tab with report content                        |
| 7   | Diagnostics on accounts view                        | Compact diagnostics + accounts table                                    |

---

## Workflow mapping

The backlog workflow (create account → draft → post → allocate → reconcile → interest → transfer → report → export) is **partially UI-testable**:

| Step                    | UI E2E          | Notes                                |
| ----------------------- | --------------- | ------------------------------------ |
| Create trust account    | Not in UI       | Workbench uses single seeded account |
| Create/post transaction | Not in UI       | Seeded by `seedTrustWorkbenchData`   |
| Allocate                | Not in UI       | Seeded                               |
| Reconciliation          | Read-only table | Seeded run visible                   |
| Interest                | Read-only table | Seeded accrual visible               |
| Transfer                | Read-only table | Seeded posted transfer visible       |
| Generate report         | **Tested**      | User action in reports view          |
| Export CSV / print HTML | **Tested**      | Buttons + print popup                |

Full mutation workflow is validated via **REST** in `trust-api-workflow-validation.test.ts`.

---

## Playwright execution

Run:

```bash
pnpm test:e2e testing/playwright/e2e/law-015-trust-workflow.spec.ts
```

Runs against the `law-trust` Playwright project (`@apzhub/law-platform` on port 3301).

If Chromium or the law-platform dev server is unavailable, document as an **environment limitation** (same pattern as LAW-012-08).

### Known environment blockers (2026-07-07)

1. Trust E2E runs against `@apzhub/law-platform` (port 3302), not `@apzhub/web` (3300).
2. Playwright config: `testing/playwright/playwright.law.config.ts` · script: `pnpm test:e2e:law`
3. **Client bundle:** PostgreSQL modules must not load in browser bundles — partial fix in LAW-015-13 (`create-app-action-executor` uses in-memory repos only); full split deferred.
4. **Auth:** Requires PostgreSQL + `BETTER_AUTH_URL` matching law-platform port.
5. **Route fix:** Unified `[trustTransactionId]` for post + reverse endpoints (dev server startup blocker fixed). The spec is present and CI-ready when Playwright browsers are installed.

---

## Environment notes

- Base URL (law-trust): `http://localhost:3301`
- Platform web (other specs): `http://localhost:3300`
- `NEXT_PUBLIC_E2E_TEST_HOOKS=true` set by Playwright config
- Trust UI uses in-process workbench (`TrustWorkflowProvider`), not REST-backed lists
