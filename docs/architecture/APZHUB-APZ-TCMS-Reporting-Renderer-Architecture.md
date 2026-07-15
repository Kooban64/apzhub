# APZHUB Reporting Renderer Architecture

**Milestone:** APZTCMS-024

## Separation of concerns

| Layer | Location | Role |
|-------|----------|------|
| Template | `ReportTemplate` + template engine | Structure + placeholder binding |
| Layout | Canonical document sections/blocks | Normalised content tree |
| Renderer | `output/*.ts` | Format-specific serialisation |
| Output | `output/index.ts` | `RenderedReportOutput` envelope |

Renderers consume `CanonicalReportDocument` only. They must not calculate business values, query persistence, or call domain services.

## Canonical model

`CanonicalReportDocument` is the single intermediate representation shared by all six output providers. It includes title, branding, metrics array, sections with typed blocks, and metadata map.

## Service operations

| Operation | Persists metadata | Notes |
|-----------|-------------------|-------|
| `previewReport` | Yes (`preview: true`) | Same bind/render path |
| `generateReport` | Yes (`preview: false`) | Production generation |
| `renderReport` | No | Re-render existing document |
| `validateReport` | No | Binding validation only |

## Checksum

Every `RenderedReportOutput` includes `checksumSha256` (full hex) and `byteLength` computed from the rendered body bytes.
