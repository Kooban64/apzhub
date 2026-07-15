# APZHUB Platform Document OpenAPI Guide

**Milestone:** APZDOCS-004  
**Spec:** [`docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`](../specs/APZHUB-Platform-OpenAPI-v1.yaml)

## Tag

**Platform Documents** — canonical Document Platform metadata API. Metadata and version descriptors only; no binary transfer.

## Schemas

Canonical request DTOs (examples):

- `CreateDocumentRequest`
- `UpdateDocumentMetadataRequest`
- `ClassifyDocumentRequest`
- `TagDocumentRequest`
- `AssignDocumentFolderRequest` / `AssignDocumentCollectionRequest`
- `ApplyDocumentRetentionRequest`
- `RelateDocumentRequest`

Responses reuse the platform success / collection / error envelopes.

## Validation

```bash
pnpm openapi:validate:platform
```

Runtime load uses `loadPlatformOpenApiSpecObject()` (`apps/web/lib/api/v1/openapi.ts`) with an elevated YAML alias limit for the shared response anchors.

## Consumer rules

- Treat OpenAPI as the HTTP contract; prefer `createHttpDocumentClient()` over ad-hoc fetch.
- Do not invent binary upload/download operations — they are out of scope for APZDOCS-004.
