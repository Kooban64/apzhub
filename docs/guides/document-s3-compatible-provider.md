# Document S3-Compatible Provider Guide

**Milestone:** APZDOCS-002  
**Package:** `@apzhub/document-storage`

## When to use

Preferred production provider for AWS S3, MinIO, and other S3-compatible endpoints.

## Configuration

```ts
import { createDocumentStorageForProduction } from "@apzhub/document-storage";

const storage = await createDocumentStorageForProduction({
  config: {
    mode: "s3",
    providerId: "s3-primary",
    s3Endpoint: "https://minio.example.internal", // optional for AWS
    s3Region: "eu-west-1",
    s3Bucket: "apzhub-documents",
    s3ForcePathStyle: true, // typical for MinIO
    s3AccessKeyRef: "secret://tenant/system/s3-access",
    s3SecretKeyRef: "secret://tenant/system/s3-secret",
    s3SessionTokenRef: undefined,
    tlsRequired: true,
    maxObjectBytes: 64 * 1024 * 1024,
    checksumAlgorithm: "sha256",
    allowBinaryDeletion: false,
  },
  secretResolver: {
    async resolve({ credentialRef, tenantId, correlationId }) {
      // Platform SecretProvider — never log resolved values
      return { value: await resolveSecret(credentialRef) };
    },
  },
});
```

## Behaviour

- Credentials resolved once at initialise via secret refs
- `PutObject` / `GetObject` / `HeadObject` / `DeleteObject` via `@aws-sdk/client-s3`
- Unsafe storage keys rejected
- Provider ETag stored observationally only — **not** the canonical checksum
- Injected `s3Client` supported for unit tests (no network)

## MinIO notes

Set `s3Endpoint` + `s3ForcePathStyle: true`. Use the same contract as AWS S3.
