# Document Filesystem Provider Guide

**Milestone:** APZDOCS-002  
**Package:** `@apzhub/document-storage`

## When to use

Local development, single-node on-prem, or explicitly approved production deployments where object storage is unavailable.

## Configuration

```ts
import { createDocumentStorageForProduction } from "@apzhub/document-storage";

const storage = await createDocumentStorageForProduction({
  config: {
    mode: "filesystem",
    providerId: "filesystem",
    filesystemRoot: "/var/apzhub/documents",
    allowFilesystemInProduction: true, // required when production=true
    maxObjectBytes: 64 * 1024 * 1024,
    checksumAlgorithm: "sha256",
    allowBinaryDeletion: false,
    stagingDirectory: "/var/apzhub/documents/.staging", // optional
  },
});
```

## Behaviour

- Root and staging directories created with mode `0750`
- Objects written via staging temp file then atomic rename
- Path traversal (`..`, absolute keys) rejected
- Existing object → overwrite denied (immutability)
- Health check verifies root accessibility

## Security notes

- Never expose `filesystemRoot` in diagnostics (config redaction uses `hasFilesystemRoot` only)
- Prefer S3-compatible storage for multi-node production
- See [document-storage-security](./document-storage-security.md)
