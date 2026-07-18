# APZHUB Platform Document — Storage Abstraction

**Milestone:** APZDOCS-001 (interfaces) · **APZDOCS-002** (implementations)  
**Status:** Ports in core; filesystem + S3 + memory implemented in `@apzhub/document-storage`

## Intent

Binary storage is pluggable. APZDOCS-001 defined `DocumentStorageProvider` and registry contracts. APZDOCS-002 delivers production implementations.

## Supported providers

| Kind         | Notes                                                     |
| ------------ | --------------------------------------------------------- |
| `filesystem` | Implemented — local/on-prem with explicit production flag |
| `s3`         | Implemented — S3-compatible (AWS / MinIO)                 |
| `azure_blob` | Unimplemented placeholder                                 |
| `gcs`        | Unimplemented placeholder                                 |
| `minio`      | Use `s3` kind with custom endpoint                        |
| `memory`     | Test-only (`memory_test` mode)                            |
| `custom`     | Extension                                                 |

## Contract

See [Document Storage Provider Architecture](./APZHUB-Document-Storage-Provider-Architecture.md).

## APZDOCS-002 rule

Domain callers use `DocumentContentService` / storage coordinator. Products must not call `putObject` / `getObject` on providers directly.
