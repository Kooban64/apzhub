# APZHUB Reporting Output Providers

**Milestone:** APZTCMS-024

All providers live under `packages/testing-services/src/reporting/output/` and implement format-specific serialisation from `CanonicalReportDocument`.

| Format | Module | Content-Type | Encoding | Implementation |
|--------|--------|--------------|----------|----------------|
| HTML | `html.ts` | `text/html` | utf-8 | Semantic HTML5 with escaped text |
| Markdown | `markdown.ts` | `text/markdown` | utf-8 | Headings, tables, lists |
| JSON | `json.ts` | `application/json` | utf-8 | Pretty-printed document |
| CSV | `csv.ts` | `text/csv` | utf-8 | Metrics + first table flatten |
| PDF | `pdf.ts` | `application/pdf` | binary (base64) | Minimal PDF-1.1, no npm deps |
| DOCX | `docx.ts` | OOXML wordprocessingml | binary (base64) | Minimal DOCX ZIP via `zlib` + manual ZIP headers |

Entry point: `renderOutput(document, format)` returns `RenderedReportOutput` with checksum and byte length.

## Design constraints

- No external PDF/DOCX libraries — self-hosted OSS first
- Same canonical input for every format
- No charts or embedded analytics widgets
- Binary formats expose base64 body with `encoding: "binary"`
