# Document Content Integrity

**Milestone:** APZDOCS-002

## Authority

Canonical checksum = **SHA-256 hex** computed by the platform integrity service over collected bytes **before** and verified **after** provider write.

Provider ETags are **ignored** as integrity authority (`providerEtagIgnored: true`).

## API

`createDocumentIntegrityService()` in `@apzhub/document-core`:

| Method | Role |
|--------|------|
| `collect(source, { maxBytes, signal })` | Materialise bytes/stream with size cap |
| `hash(bytes)` | SHA-256 hex |
| `verify({ bytes, expectedHex, expectedByteLength })` | Classify valid / mismatch / size_mismatch |

## Classifications

`valid` · `checksum_mismatch` · `size_mismatch` · `corrupt` · `incomplete`

## Store path

1. Collect + hash
2. Persist pending metadata with `checksumHex`
3. `putObject` with checksum hint
4. Re-verify; on failure → `reconciliation_required` + `checksum_mismatch` error

See [ADR-document-checksum-authority](../decisions/ADR-document-checksum-authority.md).
