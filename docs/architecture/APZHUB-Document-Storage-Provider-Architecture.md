# APZHUB Document Storage Provider Architecture

**Milestone:** APZDOCS-002  
**Status:** Complete (filesystem + S3-compatible + memory test)

## Intent

Binary storage is pluggable via `DocumentStorageProvider`. Domain and products call `DocumentContentService` only — never providers directly.

## Provider kinds

| Kind                  | Status                                           |
| --------------------- | ------------------------------------------------ |
| `filesystem`          | Implemented (`@apzhub/document-storage`)         |
| `s3` / MinIO (S3 API) | Implemented                                      |
| `memory`              | Test-only (`memory_test` config mode)            |
| `azure_blob`          | Unimplemented placeholder (`implemented: false`) |
| `gcs`                 | Unimplemented placeholder                        |
| `custom`              | Extension reserved                               |

Unimplemented providers **cannot** be registered as active (`capabilities.implemented` required).

## Contract surface

```text
DocumentStorageProvider
  initialise / validateConfiguration / healthCheck / dispose
  putObject / getObject / headObject / deleteObject
  verifyObject
  listCapabilities
```

Registry: `createDocumentStorageProviderRegistry()` — register, setActive, diagnostics.

## Package boundary

- **Contracts / core** define ports and coordinator — no cloud SDKs
- **`@apzhub/document-storage`** owns filesystem, S3 (`@aws-sdk/client-s3`), and memory providers
- Secrets use **refs** + `DocumentSecretResolver` — never inline credential values in config/logs

## Factories

- `createDocumentStorageForProduction({ config, secretResolver? })` — filesystem or S3 only
- `createDocumentStorageForTest(...)` — memory by default; filesystem/S3 when configured

Production forbids `memory_test`. Filesystem in production requires `allowFilesystemInProduction: true`.

## Immutability

`putObject` refuses overwrite when the object already exists. Content versions are always `immutable: true`.

## Related

- [Filesystem provider guide](../guides/document-filesystem-provider.md)
- [S3-compatible provider guide](../guides/document-s3-compatible-provider.md)
- [Storage configuration](../guides/document-storage-configuration.md)
- [ADR-document-storage-provider-selection](../decisions/ADR-document-storage-provider-selection.md)
