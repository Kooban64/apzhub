# Document Storage — Production Deployment

**Milestone:** APZDOCS-002

## Checklist

1. Apply migrations **0039** and **0040** (version + storage_object + RLS).
2. Choose provider: prefer **S3-compatible**; filesystem only with explicit flag.
3. Wire secrets via platform SecretProvider refs — no env plaintext in repo.
4. Compose foundation:

```ts
import { createDocumentPersistenceForProduction } from "@apzhub/document-persistence";
import { createDocumentStorageForProduction } from "@apzhub/document-storage";
import { createDocumentPlatformFoundation } from "@apzhub/document-core";

const persistence = createDocumentPersistenceForProduction({ postgresDb });
const storage = await createDocumentStorageForProduction({ config, secretResolver });

const foundation = createDocumentPlatformFoundation({
  ...persistence,
  provider: storage.provider,
  registry: storage.registry,
  maxObjectBytes: config.maxObjectBytes,
  allowBinaryDeletion: config.allowBinaryDeletion,
});

// foundation.documents — metadata PlatformDocumentService
// foundation.content — DocumentContentService (store/read/verify/delete/reconcile inspect)
```

5. Confirm health: `provider.healthCheck()` / registry `diagnostics()`.
6. Keep `allowBinaryDeletion: false` until retention policy is approved.
7. Monitor `reconciliation_required` / `failed` statuses (manual until workers exist).

## Do not deploy yet

HTTP gateway, Workbench, Event Bus subscribers, OCR/AI pipelines — deferred to **APZDOCS-003+** (not started).

## Coexistence

Use non-conflicting storage buckets/paths with legacy stacks; see `ENVIRONMENT.md` for host ports.
