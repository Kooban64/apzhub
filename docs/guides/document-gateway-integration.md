# Document Gateway Integration Guide

**Milestone:** APZDOCS-003  
**Audience:** Platform engineers wiring Document Platform into `createPlatformServices`  
**Entry points:** `PlatformServiceGateway.documents` / `document*` / `documentPlatform`

---

## Bootstrap

```typescript
import {
  createPlatformServices,
  createDocumentPlatformServicesForProduction,
} from "@apzhub/platform-services";

const documents = await createDocumentPlatformServicesForProduction({
  postgresDb,
  storageConfig: {
    mode: "filesystem", // or s3_compatible — never memory_test in production
    providerId: "fs-primary",
    maxObjectBytes: 32 * 1024 * 1024,
    checksumAlgorithm: "sha256",
    allowBinaryDeletion: false,
    // ... provider-specific fields
  },
  secretResolver, // optional — resolves secret refs for S3
});

const { gateway } = createPlatformServices({
  documents,
  accessResolver,
  authorizationMode: "production",
});
```

When `documents` is omitted, any document facet throws:

```text
PlatformServiceError {
  category: "configuration",
  code: "PROVIDER_CAPABILITY_UNSUPPORTED",
  message: "Document Platform services are not enabled"
}
```

## Calling facets

```typescript
const ctx = {
  tenantId,
  userId,
  correlationId,
  organisationId,
  permissions, // server-authoritative grants
};

const doc = await gateway.documents.create(ctx, { title: "Spec" });
await gateway.documentTags.tag(ctx, {
  documentId: doc.id,
  tagNames: ["alpha"],
});
await gateway.documentFolders.assign(ctx, {
  documentId: doc.id,
  folderId: "folder_1",
});

const versions = await gateway.documentVersions.list(ctx, doc.id);
const meta = await gateway.documentStorage.getStorageMetadata(
  ctx,
  doc.id,
  versions[0].id,
);
// meta has version + storageObject descriptors — never bytes
```

Full nested access:

```typescript
gateway.documentPlatform.documents.get(ctx, documentId);
```

## Pipeline behaviour

1. `createPlatformServices` builds a `RequestPipeline`.
2. `documents.wrapWithPipeline(pipeline)` wraps each facet with `wrapServiceWithPipeline`.
3. Production authz resolves `${service}.${operation}` via `operation-authorization-map.ts`.
4. Thin impls map context and delegate to `DocumentPlatformFoundation`.

## What stays off the gateway

| Capability | Where it lives |
| ---------- | -------------- |
| `storeContent` / `readContent` | `foundation.content` (Document Core) — not gateway |
| Provider `put` / `get` / `delete` | Storage providers only |
| REST `/api/v1/documents` | **APZDOCS-004** (not authorised) |
| Workbench uploads | Future milestone |

Binary store in tests may call `documents.foundation.content.storeContent(...)` directly; products must not import Document Core for production flows once HTTP exists — until then, in-process platform consumers use the gateway for metadata and Core only behind the platform boundary.

## Tests

```bash
pnpm exec vitest run --config vitest.config.ts \
  packages/platform-services/src/services/documents/apzdocs-003-platform-services.test.ts
node scripts/apzdocs-003-platform-services-audit.mjs
```

## Related

- [Document Platform Services Architecture](../architecture/APZHUB-Document-Platform-Services-Architecture.md)
- [Document platform authorization](./document-platform-authorization.md)
- [Platform Service Gateway](../specs/APZHUB-Platform-Service-Gateway.md)
