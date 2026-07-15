# APZHUB Platform Document Typed Client Guide

**Milestone:** APZDOCS-004

## Usage

```ts
import {
  createHttpDocumentClient,
  getDocumentClient,
  setDocumentClient,
} from "@/lib/documents/document-api";

const client = createHttpDocumentClient();
const listed = await client.listDocuments({ query: "policy" });
const doc = await client.getDocument(listed.items[0]!.documentId);
```

## Methods

`listDocuments` · `getDocument` · `createDocumentMetadata` · `updateDocumentMetadata` · `archiveDocument` · `restoreDocument` · `listVersions` · `getVersion` · `getStorageMetadata` · `assignFolder` · `assignCollection` · `classify` · `tag` · `relate` · `applyRetention` · `listAudit` · `listMetadata` · `getDiagnostics`

## Constraints

- Calls **only** `/api/v1/documents/*`
- Mock client (`createMockDocumentClient`) used when `NODE_ENV=test` via `getDocumentClient()`
- No direct `@apzhub/document-core` / `platform-services` / storage imports from consumers
- Storage keys are never required by the client — HTTP redacts opaque keys

## Errors

`DocumentClientError` carries `code`, optional `status`, and `correlationId`. Use `toDocumentUserMessage()` for safe UI copy.
