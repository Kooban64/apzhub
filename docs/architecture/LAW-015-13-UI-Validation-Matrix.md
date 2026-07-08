# LAW-015-13 — UI Validation Matrix

> Trust workbench UI validation (LAW-015-13)

---

## Views

| View           | Route                  | Page testid                 | Table testid                 | E2E |
| -------------- | ---------------------- | --------------------------- | ---------------------------- | --- |
| Dashboard      | `/workspace/law/trust` | `trust-dashboard-page`      | —                            | ✅  |
| Accounts       | `.../accounts`         | `trust-accounts-page`       | `trust-accounts-table`       | ✅  |
| Transactions   | `.../transactions`     | `trust-transactions-page`   | `trust-transactions-table`   | ✅  |
| Allocations    | `.../allocations`      | `trust-allocations-page`    | `trust-allocations-table`    | ✅  |
| Reconciliation | `.../reconciliation`   | `trust-reconciliation-page` | `trust-reconciliation-table` | ✅  |
| Interest       | `.../interest`         | `trust-interest-page`       | `trust-interest-table`       | ✅  |
| Transfers      | `.../transfers`        | `trust-transfers-page`      | `trust-transfers-table`      | ✅  |
| Reports        | `.../reports`          | `trust-reports-page`        | —                            | ✅  |

---

## Navigation

| Element                   | testid                                 | E2E |
| ------------------------- | -------------------------------------- | --- |
| Sub-nav container         | `trust-sub-nav`                        | ✅  |
| Sub-nav links             | `trust-sub-nav-{kind}`                 | ✅  |
| Law sidebar Trust item    | role `button` "Trust"                  | ✅  |
| Activity bar Law Platform | role `button` "Law Platform workspace" | ✅  |

---

## Dashboard components

| Component              | testid / selector              | E2E |
| ---------------------- | ------------------------------ | --- |
| Metrics grid           | `trust-dashboard-metrics`      | ✅  |
| Diagnostics panel      | `trust-diagnostics-panel`      | ✅  |
| Recent transactions    | `trust-recent-transactions`    | ✅  |
| Compliance placeholder | `trust-compliance-placeholder` | —   |

---

## Reports & export

| Action             | testid / selector               | Unit test | E2E |
| ------------------ | ------------------------------- | --------- | --- |
| Report type select | `trust-report-type-select`      | ✅        | ✅  |
| Generate report    | role `button` "Generate report" | ✅        | ✅  |
| Export CSV         | `trust-report-export-csv`       | ✅        | ✅  |
| Print view         | `trust-report-print-view`       | ✅        | ✅  |

---

## Diagnostics counters

Validated on dashboard and accounts views:

- Ledger runs, Workflow runs, Allocation runs, Reconciliation runs
- Interest runs, Transfer runs, Reporting runs, Report events

Source: `TrustDiagnosticsPanel` reading `workflow.getDiagnosticsSnapshot()`.

---

## UI gaps (documented, not fixed in LAW-015-13)

| Gap                                         | Impact                                   |
| ------------------------------------------- | ---------------------------------------- |
| No create-account form                      | Mutations not UI-testable                |
| No transaction draft/post forms             | Workflow relies on seed data             |
| No allocation/reconciliation action buttons | Read-only tables                         |
| Workbench not REST-backed                   | UI and API use separate in-memory stores |

See [LAW-015-13 Technical Debt](./LAW-015-13-Technical-Debt.md).
