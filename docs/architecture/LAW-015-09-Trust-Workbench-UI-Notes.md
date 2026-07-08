# LAW-015-09 — Trust Workbench UI Notes

> **Story:** LAW-015-09  
> **Status:** Implemented — in-memory only  
> **Authority:** [LAW-Trust-Workbench-Planning](../specs/LAW-Trust-Workbench-Planning.md)  
> **Last updated:** 2026-07-07

---

## 1. Purpose

Law Platform workbench UI for Trust Accounting. Presents read-oriented views over the in-memory trust engine (LAW-015-02 through LAW-015-08). No accounting logic in UI components.

---

## 2. Architecture

```text
WorkbenchPage
  └── TrustManagementRouter
        ├── TrustDashboardPage
        ├── TrustAccountsPage
        ├── TrustTransactionsPage
        ├── TrustAllocationsPage
        ├── TrustReconciliationPage
        ├── TrustInterestPage
        ├── TrustTransfersPage
        └── TrustReportsPage

TrustWorkflowProvider
  └── TrustWorkbenchService
        └── getSharedTrustWorkbench()
              ├── TrustLedgerService
              ├── TrustTransactionWorkflowService
              ├── TrustAllocationService
              ├── TrustReconciliationService
              ├── TrustInterestService
              ├── TrustTransferService
              └── TrustReportingService
```

---

## 3. UX foundation

All views use the Law UX Foundation:

- `LawWorkspaceLayout`, `LawListPageLayout`, `LawPageHeader`
- `LawSearchBar`, `LawFilterBar`, `LawStatusBadge`
- `LawListTableShell`, `LawInformationCard`, `LawStatisticsCard`
- `LawLinkList`, `LawQuickActionsCard`

Sub-navigation: `TrustSubNav` links all trust sub-routes.

---

## 4. Registration

| Layer    | Mechanism                                                                     |
| -------- | ----------------------------------------------------------------------------- |
| Sidebar  | `services/legal-platform/manifests/law-trust/module.yaml`                     |
| Routes   | Client-side `parseTrustRoute()` in `workbench-page.tsx`                       |
| Commands | `legal-trust-command-handler.ts` chained in `createAppActionExecutorBundle()` |
| Provider | `TrustWorkflowProvider` in `action-workbench-shell-provider.tsx`              |
| Help     | `registerLawTrustKnowledge()` in `knowledge-hydration.ts`                     |
| Search   | `legal.trust.search` in `register-legal-search-knowledge.ts`                  |

---

## 5. Data seeding

`seedTrustWorkbenchData()` populates demo deposits, allocations, reconciliation, interest accrual, transfer, and a pending withdrawal draft on first `getSharedTrustWorkbench()` access.

Tenant: `tenant-test` · Actor: `user-001`

---

## 6. Excluded (by design)

- REST APIs and PostgreSQL persistence
- PDF/Excel/CSV export
- Bank integration
- Financial Engine extraction
- Full transaction post/transfer/interest forms (navigation stubs only for palette commands)

See [LAW-015-09 completion report](../sprint/LAW-015-09-completion-report.md).
