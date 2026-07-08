# LAW-015-12 — Trust Print View Notes

---

## Format

Print view exports are self-contained HTML documents suitable for browser print (`Ctrl+P` / `Cmd+P`).

---

## Document structure

1. Title derived from report type (e.g. "Trial Balance")
2. Metadata block: Report ID, trust account ID, generated timestamp, reporting period (when set)
3. Data table with bordered cells

---

## Print CSS

Embedded `@media print` rules:

- Reduced body margin for paper output
- Table row break avoidance where supported

No external stylesheets or CDN dependencies — suitable for offline/auditor review.

---

## Delivery

| Surface           | Behaviour                                              |
| ----------------- | ------------------------------------------------------ |
| Workbench         | `openTrustReportPrintView()` opens blob URL in new tab |
| API `format=html` | `Content-Disposition: inline` for browser rendering    |

---

## PDF placeholder

`format=pdf` returns HTTP 422 with validation message — no PDF engine is bundled in LAW-015-12.
