# F12 — Professional Quality/Security Report Pack

| Field       | Value                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| Status      | **LOCAL PROOF** 2026-08-09 (substantive draft)                                                       |
| Bar         | Scope + detailed findings + remediations + good/bad assessment + Typst PDF from artefacts/executions |
| Maps to     | RPT-009 (export / audit packs)                                                                       |
| Not claimed | Auto-publish without human residual-risk; auto GO/NO-GO                                              |

## Pattern

```text
changeEventId
  → automation executions (security tools) + evidence links + F10/F11 dispatches
  → ReportPack model (draft, unsigned)
  → JSON | markdown | Typst→PDF
  → human residual-risk + sign-off → published overlay (F12+)
```

Humans publish; **never** auto-certify. Publish ≠ certification GO/NO-GO.

## Default tools

`trivy`, `semgrep`, `nuclei`, `zap`, `greenbone` (status may be `not_run` / `dispatched` / `evidence_present` / `completed`).

## API

`GET|POST /api/v1/qep/report-packs/by-change/{changeEventId}`

| Query / method                 | Result                                     |
| ------------------------------ | ------------------------------------------ |
| `GET` _(none)_ / `format=json` | `{ pack }` (published overlay when signed) |
| `GET format=markdown`          | `{ pack, markdown }`                       |
| `GET format=pdf`               | `{ pack, pdf: { available, … } }`          |
| `POST`                         | Publish: signer + residual risk + decision |

See also `F12-PUBLISH-AND-RUN-PACKS.md`.

## Typst

- Template: `apps/web/lib/qep/report-templates/security-bill-of-health.typ`
- Binary: `APZHUB_TYPST_BIN` or `tooling/bin/typst` (local install; not a product dependency)

## Proof checklist

1. Unit: `apps/web/lib/qep/report-pack.test.ts`
2. Compose draft for a real/mock `changeEventId` with injected executions
3. Markdown export contains DRAFT + Unsigned
4. PDF compiles when Typst present (`%PDF` header)
5. No cert mutation from report-pack source

## Local proof (2026-08-09)

- Units: 5 pass (compose + policy + severity parse + Typst template + PDF compile)
- Typst binary: `tooling/bin/typst` 0.13.1 (gitignored under `tooling/bin/`)
- Sample PDF: `apps/web/.data/qep-report-packs/rpt-pack-*/security-bill-of-health.pdf` (PDF 1.7)
- Greenbone compose: **not touched**

## Explicit non-goals (original draft slice)

- Auto GO/NO-GO from severity
- Touching Greenbone compose / live VA bring-up (done separately on lovebloom)
- Metabase/Grafana chrome

**Later delivered:** human publish + Journey run-packs + GHA stubs — `F12-PUBLISH-AND-RUN-PACKS.md`.
