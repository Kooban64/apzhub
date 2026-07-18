# Document Platform — Developer Guide

**Milestone:** APZDOCS-002 (supersedes APZDOCS-001 in-memory-only guidance)

## Packages

| Package                        | Version                                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `@apzhub/document-contracts`   | 0.3.0                                                                                                    |
| `@apzhub/document-core`        | 0.3.0                                                                                                    |
| `@apzhub/document-persistence` | 0.2.0                                                                                                    |
| `@apzhub/document-storage`     | 0.1.0                                                                                                    |
| `@apzhub/platform-services`    | 0.16.0 (gateway — see [document-platform-services-developer](./document-platform-services-developer.md)) |

```bash
pnpm --filter @apzhub/document-contracts typecheck
pnpm --filter @apzhub/document-core typecheck
pnpm --filter @apzhub/document-persistence typecheck
pnpm --filter @apzhub/document-storage typecheck
pnpm exec vitest run --config vitest.config.ts \
  packages/document-contracts packages/document-core \
  packages/document-persistence packages/document-storage \
  testing/document-foundation
node scripts/apzdocs-002-persistence-storage-audit.mjs
```

## In-process composition (tests)

```ts
import { createDocumentPlatformFoundation } from "@apzhub/document-core";
import { createDocumentPersistenceForTest } from "@apzhub/document-persistence";
import { createDocumentStorageForTest } from "@apzhub/document-storage";

const persistence = createDocumentPersistenceForTest({
  allowInMemoryPersistence: true,
});
const storage = await createDocumentStorageForTest(); // memory_test default

const { documents, content } = createDocumentPlatformFoundation({
  ...persistence,
  provider: storage.provider,
  registry: storage.registry,
  maxObjectBytes: 8 * 1024 * 1024,
  allowBinaryDeletion: true,
});

const ctx = { tenantId: "t1", userId: "u1", permissions: ["document.*"] };
const doc = await documents.createDocument(ctx, { title: "Spec" });
await content.storeContent(ctx, {
  documentId: doc.id,
  mimeType: "application/pdf",
  source: { kind: "bytes", bytes: new Uint8Array([1, 2, 3]) },
});
```

## Rules for consumers

1. Import `@apzhub/document-contracts` models — never invent parallel document types.
2. Call `DocumentContentService` / `PlatformDocumentService` only — never providers or repos from products.
3. Never store binaries in platform tables.
4. Do not add REST/Workbench until **APZDOCS-004** (not authorised). For gateway consumption use **APZDOCS-003** guides.
5. Reporting / TCMS must not depend on `document-core` until an approved consumer milestone.

## Also see

- [document-platform-packages](./document-platform-packages.md)
- [Developer Guide (APZDOCS-001 archive path)](../developer/APZHUB-Platform-Document-Developer-Guide.md)
