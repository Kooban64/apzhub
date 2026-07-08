# LAW — Trust Operations Guide

> **Audience:** Trust officers, firm administrators, compliance operators  
> **Milestone:** LAW-015 — delivered  
> **Last updated:** 2026-07-08

---

## 1. Purpose

This guide describes day-to-day Trust Accounting operations using the APZHUB Law Platform Trust workbench and REST API. It assumes self-hosted deployment with appropriate permissions (`legal.trust.*`).

---

## 2. Accessing Trust Accounting

1. Sign in to the Law Platform workbench (`@apzhub/law-platform`).
2. Select **Law Platform** workspace in the activity bar.
3. Open **Trust** in the sidebar, or navigate to `/workspace/law/trust`.

Sub-views: Dashboard, Accounts, Transactions, Allocations, Reconciliation, Interest, Transfers, Reports.

---

## 3. Daily operations

| Task                  | Where                           | Notes                                           |
| --------------------- | ------------------------------- | ----------------------------------------------- |
| Review trust balance  | Dashboard                       | Total balance, matter breakdown, pending drafts |
| Check recent activity | Dashboard → Recent transactions | Last posted movements                           |
| Review pending drafts | Dashboard metric / Transactions | Drafts awaiting post                            |
| Monitor approvals     | API / future queue UI           | Pending approval count in diagnostics           |
| Run reconciliation    | Reconciliation view or API      | After significant posting activity              |

---

## 4. Reconciliation workflow

### When to reconcile

- End of business day (recommended for active accounts)
- Before month-end reporting
- After bulk deposits or transfers

### Steps (API)

1. Confirm all intended drafts are posted.
2. Call `POST /api/law/v1/trust/reconciliation?trustAccountId={id}`.
3. Review run status, warnings, and errors in response or Reconciliation table.
4. Investigate variances before period close.

### Current limitation

Bank statement leg (three-way reconciliation) is **not** implemented. Internal control compares ledger to allocations only.

---

## 5. Approvals

Operations requiring approval (configurable):

- Large withdrawals
- Reversals
- Transfers above threshold
- Allocation adjustments

### Operator actions

| Action       | API                                                              |
| ------------ | ---------------------------------------------------------------- |
| List pending | `GET /api/law/v1/trust/approvals`                                |
| Approve      | `POST /api/law/v1/trust/approvals/{id}/approve`                  |
| Reject       | `POST /api/law/v1/trust/approvals/{id}/reject` (reason required) |

Rejected requests do not post. Approved requests allow workflow to continue.

---

## 6. Diagnostics

### Workbench

Trust Dashboard and Accounts views show **Trust engine diagnostics**:

- Ledger runs, workflow runs, allocation runs
- Reconciliation runs, interest runs, transfer runs
- Reporting runs

### API

`GET /api/law/v1/trust/diagnostics` returns:

- `repositoryMode` (memory | postgres)
- `accountCount`
- `pendingApprovals`
- Approval diagnostics snapshot

Use diagnostics after incidents to confirm engine activity counts.

---

## 7. Reporting workflow

### Generate report (workbench)

1. Open **Reports** sub-view.
2. Select report type (e.g. Trial Balance, Client Statement).
3. Click **Generate report**.
4. Review latest report metadata (ID, timestamp, line counts).

### Export

| Action             | Button         | Output                              |
| ------------------ | -------------- | ----------------------------------- |
| Spreadsheet review | **Export CSV** | Download `trust-{type}-{id}.csv`    |
| Auditor / print    | **Print View** | HTML in new tab — use browser Print |

### API export

```http
GET /api/law/v1/trust/reports/{reportId}/export?format=csv
GET /api/law/v1/trust/reports/{reportId}/export?format=html
```

PDF returns 422 (not available).

---

## 8. Troubleshooting

| Symptom                 | Likely cause              | Action                                                |
| ----------------------- | ------------------------- | ----------------------------------------------------- |
| 403 on API              | Missing permission        | Verify `legal.trust.*` role assignment                |
| 404 on report export    | Wrong tenant or report ID | Confirm `x-tenant-id` and report ownership            |
| Reconciliation warnings | Unallocated receipts      | Run allocations for posted deposits                   |
| Empty workbench tables  | Fresh session             | Seed loads on first access; post transactions via API |
| Balance mismatch        | Stale projection          | Re-run reconciliation; journal is authority           |
| Export button disabled  | No report generated       | Generate report for selected type first               |

### Logs

Check application logs for correlation ID from API error envelope. Trust services emit structured diagnostics via run counters.

---

## 9. Security reminders

- Never share trust API credentials.
- Tenant header must match authenticated firm context.
- Posted transactions cannot be edited — use reversal workflow.
- Export files may contain client/matter identifiers — handle per firm data policy.

---

## 10. Related documents

- [LAW-Trust-Developer-Guide](../developer/LAW-Trust-Developer-Guide.md)
- [LAW-015-12 CSV Format Notes](../architecture/LAW-015-12-Trust-CSV-Format-Notes.md)
- [LAW-Trust-Accounting-Specification](../specs/LAW-Trust-Accounting-Specification.md)
