# SPR-OPS-PAPERLESS-004 — Documents DMS get + download

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-PAPERLESS-003](./SPR-OPS-PAPERLESS-003-documents-dms-upload.md) · [ADR-0095](../adr/ADR-0095-paperless-ngx-documents-dms-provider.md)  
> **AuthN:** BetterAuth only  
> **Does not:** Touch legacy `18082` · Native Documents SoR · Workbench UI · OCR

## Outcome

`GET /api/v1/documents/dms/documents/[id]` returns catalogue metadata.  
`GET /api/v1/documents/dms/documents/[id]/content` streams original bytes.  
Opaque reversible `dmsdoc_*` ids (no engine brand).

## Acceptance

1. BetterAuth get by list id — PASS
2. BetterAuth download returns file bytes + disposition — PASS
3. No Paperless brand; legacy `18082` untouched — PASS
4. Unit tests — PASS

## Evidence

See [paperless-004](../products/paperless-004/README.md).
