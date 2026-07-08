# LAW-015-08 — Trust Reporting Engine Notes

> **Story:** LAW-015-08  
> **Status:** Implemented — in-memory only  
> **Authority:** [LAW-015-07 Transfer Engine Notes](./LAW-015-07-Trust-Transfer-Engine-Notes.md)  
> **Last updated:** 2026-07-07

---

## 1. Purpose

In-memory Trust Reporting Engine that produces immutable read models from the Trust Accounting engine. Reports are deterministic, tenant-scoped projections — they never alter accounting data and never duplicate ledger calculations.

**TrustLedgerService remains the accounting authority.** No UI, APIs, persistence, PDF/Excel/CSV export, email, or scheduled reporting.

---

## 2. Package location

```text
apps/law-platform/lib/trust/
  trust-reporting-types.ts
  trust-reporting-errors.ts
  trust-reporting-engine.ts
  trust-report-repository.ts
  in-memory-trust-report-repository.ts
  trust-reporting-events.ts
  trust-reporting-diagnostics.ts
  trust-reporting-service.ts
  trust-reporting.test.ts
```

Ledger extensions: read-only query methods on `TrustLedgerService` (`listAccounts`, `getAccount`, `listTransactions`, `getBalances`).

---

## 3. Layering

```text
TrustReportingService              ← LAW-015-08 (read-only orchestration)
  ↓ consumes (services only)
TrustLedgerService                 ← LAW-015-02 (authority)
TrustTransactionWorkflowService    ← LAW-015-03
TrustAllocationService             ← LAW-015-04
TrustReconciliationService         ← LAW-015-05
TrustInterestService               ← LAW-015-06
TrustTransferService               ← LAW-015-07
  ↓ pure builders
trust-reporting-engine.ts          ← deterministic payload assembly
  ↓ stores
InMemoryTrustReportRepository      ← immutable report store
```

Reports never call repositories directly. No bypass of the service layer.

---

## 4. Report types

| Type                     | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `trial_balance`          | Balance projection by scope (client/matter/unallocated) |
| `ledger`                 | Ledger metadata summary (entry and transaction counts)  |
| `journal`                | Journal entry lines for the reporting period            |
| `transactions`           | Posted trust transactions for the period                |
| `client_statement`       | Client-scoped statement with opening/closing balances   |
| `matter_statement`       | Matter-scoped statement with opening/closing balances   |
| `allocation_summary`     | Allocation lines for the account                        |
| `interest_summary`       | Interest posting summary lines                          |
| `transfer_summary`       | Transfer history summary lines                          |
| `reconciliation_summary` | Reconciliation run summary lines                        |

---

## 5. Generation workflow

```text
generateReport(input)
  → validate tenant, account, report type, period, client/matter scope
  → collectSourceData() via accounting services
  → buildTrustReportPayload() (pure, deterministic)
  → freeze TrustReport
  → save to InMemoryTrustReportRepository
  → emit legal.trust.report.generated
  → record diagnostics
```

| Step                |     Mutates accounting?      |
| ------------------- | :--------------------------: |
| Validate            |              No              |
| Collect source data | No (read-only service calls) |
| Build payload       |              No              |
| Store report        |    No (report store only)    |
| Emit event          |              No              |

---

## 6. Validation

| Rule             | Enforcement                                            |
| ---------------- | ------------------------------------------------------ |
| Tenant isolation | Account lookup scoped to tenant; cross-tenant rejected |
| Report type      | Must be one of `TRUST_REPORT_TYPES`                    |
| Reporting period | `start` ≤ `end` when both provided                     |
| Client statement | `clientId` required                                    |
| Matter statement | `clientId` and `matterId` required                     |
| Account scope    | `trustAccountId` must exist for tenant                 |

---

## 7. Events

| Event                          | Payload highlights                                              |
| ------------------------------ | --------------------------------------------------------------- |
| `legal.trust.report.generated` | `reportId`, `reportType`, `trustAccountId`, `generatedByUserId` |

In-memory event bus only — no outbox.

---

## 8. Diagnostics

Session diagnostics track:

- Reports generated (total and by type)
- Generation duration
- Failures and warnings
- Per-run records via `TrustReportingRunRecord`

---

## 9. Excluded (by design)

- UI and workbench views
- REST APIs and OpenAPI
- PostgreSQL persistence
- PDF, Excel, CSV export
- Scheduled report jobs
- Email delivery
- Bank integrations
- Closed reporting period enforcement

See [LAW-015-08 completion report](../sprint/LAW-015-08-completion-report.md) for LAW-015-09 recommendation (Trust Dashboard & Workbench).
