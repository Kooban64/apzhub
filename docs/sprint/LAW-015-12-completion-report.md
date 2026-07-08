# LAW-015-12 — Trust Reports Export Pack — Completion Report

> **Story:** LAW-015-12  
> **Status:** **Complete**  
> **Date:** 2026-07-07  
> **Verdict:** TRUST REPORT EXPORTS DELIVERED — await owner approval before bank integration, scheduled reporting, outbox workers, or Financial Engine extraction

---

## Summary

LAW-015-12 adds CSV and print-friendly HTML export for all ten Trust report types. Exports consume immutable `TrustReport` read models from `TrustReportingService` — no new accounting logic. The Trust Reports workbench view includes Export CSV and Print View actions; REST clients can download via `/api/law/v1/trust/reports/{reportId}/export`.

---

## Deliverables

| Deliverable          | Location                                                                             |
| -------------------- | ------------------------------------------------------------------------------------ |
| Export serializers   | `apps/law-platform/lib/trust/trust-report-export.ts`                                 |
| Export unit tests    | `apps/law-platform/lib/trust/trust-report-export.test.ts`                            |
| Export API handler   | `apps/web/lib/api/trust/trust-api-handlers.ts`                                       |
| Export route         | `apps/web/app/api/law/v1/trust/reports/[reportId]/export/route.ts`                   |
| Workbench UI buttons | `apps/law-platform/components/trust/trust-reports-page.tsx`                          |
| UI tests             | `apps/law-platform/components/trust/trust-reports-page.test.tsx`                     |
| API tests            | `apps/web/lib/api/trust/trust-api.test.ts`                                           |
| Export notes         | [LAW-015-12-Trust-Export-Notes.md](../architecture/LAW-015-12-Trust-Export-Notes.md) |

---

## Export formats

| Format            | Status                                     | MIME type                  |
| ----------------- | ------------------------------------------ | -------------------------- |
| CSV               | Implemented                                | `text/csv; charset=utf-8`  |
| HTML (print view) | Implemented                                | `text/html; charset=utf-8` |
| PDF               | Placeholder — returns 422 validation error |

---

## Report types exported

All ten `TRUST_REPORT_TYPES`: trial balance, ledger, journal, transactions, client/matter statements, allocation, interest, transfer, and reconciliation summaries.

---

## Security

| Control          | Implementation                                    |
| ---------------- | ------------------------------------------------- |
| Authentication   | `withLawApiAuth`                                  |
| Tenant binding   | `resolveTrustTenantId` + report tenant match      |
| Permission       | `legal.trust.report` (`TRUST_REPORT_EXPORT_AUTH`) |
| Report ownership | 404 when report missing or tenant mismatch        |

---

## Quality gates

| Gate                 | Result                         |
| -------------------- | ------------------------------ |
| `pnpm lint`          | Pass                           |
| `pnpm typecheck`     | Pass                           |
| `pnpm build`         | Pass                           |
| `pnpm test`          | Pass (1844 passed, 44 skipped) |
| `pnpm test:coverage` | Pass                           |

---

## Test report

| Area                                   | Tests                      |
| -------------------------------------- | -------------------------- |
| CSV/HTML per report type               | 20 export serializer tests |
| Format normalization + PDF placeholder | 1 test                     |
| API CSV/HTML export                    | 1 test                     |
| Unsupported/placeholder formats        | 1 test                     |
| Report not found                       | 1 test                     |
| Permission denied                      | 1 test                     |
| Tenant isolation                       | 1 test                     |
| UI export buttons                      | 2 tests                    |

---

## Technical debt

See [LAW-015-12-Technical-Debt.md](../architecture/LAW-015-12-Technical-Debt.md).

---

## Stop condition

Trust report exports are complete. **Do not proceed** to bank integration, scheduled reporting, outbox workers, or Financial Engine extraction without owner approval.
