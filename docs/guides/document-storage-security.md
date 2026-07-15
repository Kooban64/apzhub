# Document Storage Security

**Milestone:** APZDOCS-002

## Controls implemented

| Control | Mechanism |
|---------|-----------|
| No binaries in Postgres | Metadata-only tables; no `bytea` |
| Secret refs | `s3AccessKeyRef` / `s3SecretKeyRef` / `encryptionKeyRef` — values via resolver |
| Config redaction | `redactDocumentStorageConfig` — no secrets, absolute paths, or object keys |
| Path safety | Reject `..`, absolute keys, traversal outside filesystem root |
| Immutability | Overwrite denied; schema `immutable = true` |
| Size limits | `maxObjectBytes` on collect + providers |
| Permissions | `document.storage.*`, `document.version.*`, `document.reconciliation.*` |
| TLS | `tlsRequired` flag on config (default true in redaction view) |
| Tenant RLS | Migrations 0040 on version + storage_object tables |

## Never

- Log resolved credentials, full storage keys in diagnostics, or binary payloads
- Register unimplemented Azure/GCS providers as active
- Use `memory_test` in production
- Bypass coordinator to call providers from product modules

## Future (not this milestone)

Gateway authz integration, signed download URLs, CMEK policies, malware scanning.
