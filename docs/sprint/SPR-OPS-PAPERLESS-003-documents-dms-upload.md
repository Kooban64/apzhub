# SPR-OPS-PAPERLESS-003 — Documents DMS upload (ingest)

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-PAPERLESS-002](./SPR-OPS-PAPERLESS-002-documents-dms-paperless-foundation.md) · [ADR-0095](../adr/ADR-0095-paperless-ngx-documents-dms-provider.md)  
> **AuthN:** BetterAuth only  
> **Does not:** Touch legacy `18082` · Replace native Documents SoR · OCR/viewer/Workbench UI

## Outcome

`POST /api/v1/documents/dms/documents` (multipart) accepts a file, forwards ingest to Paperless LTS on **19082**, and returns an opaque `dmsingest_*` acknowledgment. Native Documents SoR is unchanged.

## Ships

| ID  | Ship               | Landed                                                 |
| --- | ------------------ | ------------------------------------------------------ |
| U1  | Adapter upload     | `post_document` via adapter fetch                      |
| U2  | Platform DMS facet | `uploadDocument`                                       |
| U3  | HTTP               | `POST /api/v1/documents/dms/documents`                 |
| U4  | Dogfood            | BetterAuth upload → list shows title; legacy untouched |

## Acceptance

1. Upload returns `status: accepted` + opaque `ingestId` — PASS
2. No Paperless brand / raw engine ids — PASS
3. Native Documents path independent; legacy `18082` up — PASS
4. Unit tests for adapter + ops upload — PASS

## Evidence

See [paperless-003](../products/paperless-003/README.md).
