# LAW-015-12 — Trust Export Notes

> CSV and HTML export for Trust Accounting reports

---

## Architecture

Exports are **presentation-only serializers** over existing `TrustReport.payload` read models. The reporting engine remains the accounting authority — export code never recomputes balances or transactions.

```text
TrustReport (immutable)
  → trust-report-export.ts
    → CSV (attachment) | HTML (inline print view)
```

---

## Module API

| Function                                | Purpose                          |
| --------------------------------------- | -------------------------------- |
| `exportTrustReportToCsv(report)`        | RFC-style CSV with quoted fields |
| `exportTrustReportToHtml(report)`       | Print-friendly HTML document     |
| `exportTrustReport(report, format)`     | Dispatcher for `csv` \| `html`   |
| `downloadTrustReportCsv(report)`        | Browser download (workbench)     |
| `openTrustReportPrintView(report)`      | Opens HTML in new tab            |
| `normalizeTrustReportExportFormat(raw)` | Parses `format` query param      |

---

## REST API

```
GET /api/law/v1/trust/reports/{reportId}/export?format=csv
GET /api/law/v1/trust/reports/{reportId}/export?format=html
```

- Permission: `legal.trust.report`
- Returns raw file body (not JSON envelope)
- Includes `Content-Disposition` and correlation/request IDs

---

## Workbench UI

Trust Reports view (`/workspace/law/trust/reports`):

- **Export CSV** — client-side download from in-memory report
- **Print View** — opens HTML export in new browser tab

Buttons appear after a report is generated for the selected type.

---

## Out of scope (LAW-015-12)

- PDF engine
- Excel/XLSX
- Scheduled/email delivery
- Bank feeds
- Outbox workers
