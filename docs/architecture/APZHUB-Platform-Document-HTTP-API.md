# APZHUB Platform Document HTTP API

**Milestone:** APZDOCS-004  
**Base path:** `/api/v1/documents`  
**Status:** Implemented — metadata only (no binary upload/download)

## Request path

```text
HTTP → withPlatformApiAuth → handlers/documents.ts
  → PlatformServiceGateway.document*
  → RequestPipeline (documentPlatformOps)
  → Authorization (document.*)
  → Document Platform Services → Document Core
```

Handlers contain no business logic and must not import `@apzhub/document-core`, persistence, or storage SDKs.

## Endpoints (summary)

| Method | Path                                         | Gateway facet                                            |
| ------ | -------------------------------------------- | -------------------------------------------------------- |
| GET    | `/`                                          | `documentSearchMetadata.find`                            |
| POST   | `/`                                          | `documents.create`                                       |
| GET    | `/{documentId}`                              | `documents.get`                                          |
| PATCH  | `/{documentId}`                              | `documentMetadata.update`                                |
| POST   | `/{documentId}/archive`                      | `documents.archive`                                      |
| POST   | `/{documentId}/restore`                      | `documents.restore`                                      |
| GET    | `/{documentId}/versions`                     | `documentVersions.list`                                  |
| GET    | `/{documentId}/versions/{versionId}`         | `documentVersions.get`                                   |
| GET    | `/{documentId}/versions/{versionId}/storage` | `documentStorage.getStorageMetadata` (keys redacted)     |
| POST   | `/{documentId}/versions/{versionId}/verify`  | `documentStorage.verifyIntegrity`                        |
| GET    | `/{documentId}/audit`                        | `documentAudit.list`                                     |
| POST   | `/{documentId}/classify`                     | `documentClassification.classify`                        |
| POST   | `/{documentId}/tags`                         | `documentTags.tag`                                       |
| POST   | `/{documentId}/folder`                       | `documentFolders.assign`                                 |
| POST   | `/{documentId}/collection`                   | `documentCollections.assign`                             |
| POST   | `/{documentId}/retention`                    | `documentRetention.apply`                                |
| POST   | `/{documentId}/relationships`                | `documentRelationships.relate`                           |
| GET    | `/tags`                                      | `documentTags.list`                                      |
| GET    | `/tags/{tagId}`                              | `documentTags.get`                                       |
| GET    | `/diagnostics`                               | `documentDiagnostics.getDiagnostics`                     |
| GET    | `/reconciliation`                            | `documentStorage.inspectReconciliation` (hints redacted) |

## Behaviour

- Pagination / filtering via query params where applicable (`query`, `status`, `classification`, `tagName`, `limit`)
- Tenant / organisation isolation via `ServiceRequestContext` (server authoritative)
- Correlation IDs and structured error envelopes (platform API standard)
- No binary streaming, multipart uploads, or downloads

## Permissions

`document.*` families enforced in RequestPipeline (`documentPlatformOps`). See [Document Platform Authorization](../guides/document-platform-authorization.md) · [Security Guide](../security/APZHUB-Platform-Document-HTTP-Security-Guide.md).

## OpenAPI

Tag **Platform Documents** in `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` — validate with `pnpm openapi:validate:platform`.
