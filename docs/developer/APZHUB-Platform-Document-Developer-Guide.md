# APZHUB Platform Document — Developer Guide

**Milestone:** APZDOCS-001 (foundation)  
**Updated for:** APZDOCS-002 — see [guides/document-platform-developer.md](../guides/document-platform-developer.md) for current composition.

## Packages

```bash
pnpm --filter @apzhub/document-contracts typecheck
pnpm --filter @apzhub/document-core typecheck
pnpm --filter @apzhub/document-persistence typecheck
pnpm --filter @apzhub/document-storage typecheck
```

## Create a domain + content foundation (APZDOCS-002)

```ts
import { createDocumentPlatformFoundation } from "@apzhub/document-core";
import { createDocumentPersistenceForTest } from "@apzhub/document-persistence";
import { createDocumentStorageForTest } from "@apzhub/document-storage";

const persistence = createDocumentPersistenceForTest({
  allowInMemoryPersistence: true,
});
const storage = await createDocumentStorageForTest();
const { documents, content } = createDocumentPlatformFoundation({
  ...persistence,
  provider: storage.provider,
  registry: storage.registry,
  maxObjectBytes: 8 * 1024 * 1024,
  allowBinaryDeletion: true,
});
```

## Rules for consumers

1. Import contracts/core — never invent parallel document models.
2. Never store binaries in platform tables.
3. Call `DocumentContentService` — never storage providers from products.
4. Do not add REST/Workbench until **APZDOCS-004** (not authorised). For gateway consumption use **APZDOCS-003** guides.

## Audit

```bash
node scripts/apzdocs-002-persistence-storage-audit.mjs
```
