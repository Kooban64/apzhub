# APZHUB Platform Document Workbench

**Milestone:** APZDOCS-005  
**Route:** `/workspace/documents`  
**Status:** Implemented — metadata-only presentation over typed HTTP client

## Purpose

Product-neutral Document Platform workbench. Thin presentation layer — no domain logic, uploads, downloads, previews, OCR, AI, or search engine.

## Architecture

```text
Workbench (PlatformDocumentsView)
  → document-api / createHttpDocumentClient()
  → HTTP /api/v1/documents
  → PlatformServiceGateway
  → RequestPipeline → Authorization → Platform Services → Document Core
```

## Sections

| Section | Path | Content |
|---------|------|---------|
| Overview | `/workspace/documents/overview` | Summary + document list |
| Documents | `/workspace/documents/documents` | Document list / details |
| Versions | `/workspace/documents/versions` | Version + checksum metadata |
| Collections | `/workspace/documents/collections` | Collection assignment rollup |
| Folders | `/workspace/documents/folders` | Folder assignment rollup |
| Tags | `/workspace/documents/tags` | Tag rollup |
| Relationships | `/workspace/documents/relationships` | Read-only relationship context |
| Retention | `/workspace/documents/retention` | Retention IDs |
| Audit | `/workspace/documents/audit` | Audit history |
| Diagnostics | `/workspace/documents/diagnostics` | Safe readiness metadata |
| Metadata | `/workspace/documents/metadata` | Metadata-focused list |

## Commands

Refresh · View Metadata · View Versions · View Relationships · View Retention · View Audit · Open Folder · Open Collection · Inspect Diagnostics · Copy Document ID · Copy Version ID

No upload, delete, edit, or binary actions.

## Manifests

`packages/workbench-framework/manifests/platform-documents*/module.yaml` — permissions `document.read` and finer `document.*` keys per section.

## Accessibility

Keyboard-reachable table rows and commands, ARIA toolbar/status/alert regions, labelled filters, responsive layout, WCAG-oriented token colours.
