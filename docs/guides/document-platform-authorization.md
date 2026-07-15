# Document Platform Authorization Guide

**Milestone:** APZDOCS-003  
**Canonical sources:**
- Permissions: `packages/document-contracts/src/permissions/catalogue.ts` → `PLATFORM_DOCUMENT_PERMISSIONS`
- Catalogue merge: `packages/platform-services/src/authorization/permission-catalogue.ts`
- Operation map: `packages/platform-services/src/authorization/operation-authorization-map.ts` (`documentPlatformOps`)

---

## Model

Document gateway operations enforce authorization through the shared **RequestPipeline** (same pattern as Testing / Support):

```text
gateway.documentFolder.assign(ctx, …)
  → pipeline key documentFolder.assign
  → resolveOperationAuthorization → requiredPermission
  → accessResolver / production policy
  → thin service impl → document-core
```

Wildcard `document.*` may be granted to roles for broad access; it is **not** a security bypass and remains audited like any other grant.

## Permission catalogue (APZDOCS-003)

Additive keys (stable; do not rename):

| Permission | Typical use |
| ---------- | ----------- |
| `document.read` | Get / summarize / metadata find / diagnostics |
| `document.write` / `document.manage` | Broad write/manage (catalogue; prefer specific ops) |
| `document.create` | Create document |
| `document.archive` / `document.restore` | Lifecycle |
| `document.delete` | Delete (catalogue; gateway delete not exposed in 003) |
| `document.classify` | Classification |
| `document.retention` | Apply retention |
| `document.audit` | List audit |
| `document.metadata.read` / `document.metadata.write` | Metadata |
| `document.tag.read` / `document.tag.write` | Tags |
| `document.relationship.read` / `document.relationship.write` | Relationships |
| `document.folder.read` / `document.folder.write` | Folders |
| `document.collection.read` / `document.collection.write` | Collections |
| `document.version.create` / `document.version.read` | Versions (create remains Core content path) |
| `document.storage.*` | Storage metadata / verify / delete |
| `document.reconciliation.read` / `document.reconciliation.repair` | Reconciliation |

## Operation → permission map

| Pipeline service | Operation | Required permission |
| ---------------- | --------- | ------------------- |
| `documentService` | `create` | `document.create` |
| `documentService` | `get` / `summarize` | `document.read` |
| `documentService` | `archive` | `document.archive` |
| `documentService` | `restore` | `document.restore` |
| `documentVersion` | `list` / `get` | `document.version.read` |
| `documentStorage` | `getStorageMetadata` | `document.storage.read` |
| `documentStorage` | `verifyIntegrity` | `document.storage.verify` |
| `documentStorage` | `inspectReconciliation` | `document.reconciliation.read` |
| `documentCollection` | `assign` | `document.collection.write` |
| `documentFolder` | `assign` | `document.folder.write` |
| `documentTag` | `tag` | `document.tag.write` |
| `documentTag` | `list` / `get` | `document.tag.read` |
| `documentRelationship` | `relate` | `document.relationship.write` |
| `documentRetention` | `apply` | `document.retention` |
| `documentAudit` | `list` | `document.audit` |
| `documentMetadata` | `update` | `document.metadata.write` |
| `documentClassification` | `classify` | `document.classify` |
| `documentSearchMetadata` | `find` | `document.read` |
| `documentDiagnostics` | `getDiagnostics` | `document.read` |

Lookup:

```typescript
import {
  resolveOperationAuthorization,
  PLATFORM_SERVICE_PERMISSION_CATALOGUE,
} from "@apzhub/platform-services";
import { PLATFORM_DOCUMENT_PERMISSIONS } from "@apzhub/document-contracts";
```

## Maintenance rules

1. New gateway method → new `documentPlatformOps` map entry **before** merge.
2. Permission key must exist in `PLATFORM_DOCUMENT_PERMISSIONS` and thus the platform catalogue.
3. Resource ID argument index must match method signature (context stripped).
4. Never map domain-only helpers that are not on the gateway.

## Related

- [Platform Authorization Reference](../architecture/APZHUB-Platform-Authorization-Reference-Architecture.md)
- [Testing Operation Permission Map](../architecture/APZHUB-Testing-Operation-Permission-Map.md) (same pipeline pattern)
- [Document Platform Permissions](../architecture/APZHUB-Platform-Document-Permissions.md)
