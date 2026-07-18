# Document Storage Configuration

**Milestone:** APZDOCS-002  
**Types:** `DocumentStorageConfig` / `validateDocumentStorageConfig` / `redactDocumentStorageConfig` in `@apzhub/document-core`

## Modes

| `mode`        | Production                                          | Notes                                           |
| ------------- | --------------------------------------------------- | ----------------------------------------------- |
| `filesystem`  | Allowed only if `allowFilesystemInProduction: true` | Requires `filesystemRoot`                       |
| `s3`          | Preferred                                           | Requires bucket, region, access/secret key refs |
| `memory_test` | **Forbidden**                                       | Tests only                                      |

## Required fields (all modes)

- `providerId`
- `maxObjectBytes` (> 0)
- `checksumAlgorithm: "sha256"`
- `allowBinaryDeletion`

## Optional

`allowedMimeTypes`, `stagingDirectory`, `s3Endpoint`, `s3ForcePathStyle`, `s3SessionTokenRef`, `tlsRequired`, `encryptionKeyRef`

## Validation

```ts
import { validateDocumentStorageConfig } from "@apzhub/document-core";

const result = validateDocumentStorageConfig(config, { production: true });
// result.ok / result.errors
```

## Safe diagnostics

Always publish `redactDocumentStorageConfig(config)` to ops surfaces — never raw config.
