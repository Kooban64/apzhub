# Document Platform Packages

**Milestone:** APZDOCS-002

| Package                        | Path                             | Version | Depends on                            | Role                                                                                                     |
| ------------------------------ | -------------------------------- | ------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `@apzhub/document-contracts`   | `packages/document-contracts/`   | 0.2.0   | —                                     | Models, permissions, `PlatformDocumentService`, `DocumentContentService`, integrity/reconciliation types |
| `@apzhub/document-core`        | `packages/document-core/`        | 0.2.0   | contracts                             | Domain service, storage ports, integrity, coordinator, config, foundation factory                        |
| `@apzhub/document-persistence` | `packages/document-persistence/` | 0.2.0   | contracts, core, config               | Postgres + in-memory repos; production/test factories                                                    |
| `@apzhub/document-storage`     | `packages/document-storage/`     | 0.1.0   | contracts, core, `@aws-sdk/client-s3` | filesystem / S3 / memory providers + factories                                                           |

## Dependency rules

```text
contracts  ←  core  ←  persistence
                  ↑
               storage
```

- contracts → no core/persistence/storage
- core → no persistence/storage/cloud SDKs
- persistence → no document-storage / apps
- storage → no products / apps
- reporting / testing packages → must not import document-core/storage/persistence (APZDOCS-002 audit)

## Schema ownership

DDL lives in `packages/config` (`platform-document-schema`, migrations 0037–0040). Persistence maps rows; it does not own binary bytes.

## Exports of note

- `createDocumentPlatformFoundation`
- `createDocumentPersistenceForProduction` / `ForTest`
- `createDocumentStorageForProduction` / `ForTest`
- `createDocumentStorageCoordinator` / `createDocumentIntegrityService`
- `validateDocumentStorageConfig` / `redactDocumentStorageConfig`
