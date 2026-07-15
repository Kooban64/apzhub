# APZHUB APZ TCMS — Artifact Metadata Guide

**Milestone:** APZTCMS-015

---

## Principle

APZ TCMS stores **artifact references only**. Binaries are never downloaded, uploaded, or hosted by the CI/CD integration framework.

---

## ArtifactReference fields

| Field | Purpose |
| ----- | ------- |
| `name` | Display / identity label |
| `sizeBytes` | Optional size metadata |
| `type` | MIME or logical type |
| `checksum` | Integrity fingerprint (e.g. sha256) |
| `storageProvider` | Hint (s3, gcs, azure_blob, …) |
| `uriReference` | Opaque URI or locator string |
| `createdAt` | Creation timestamp |
| `retentionDays` / `retentionUntil` | Retention metadata |

---

## Operations

- Import adapters may include `artifacts[]` on `CanonicalPipelineResult`.
- `linkArtifacts(runId, artifacts)` merges additional references onto a run.
- Log bodies use `PipelineLogReference` (URI/size/checksum) — same no-fetch rule.

---

## Explicit non-goals

- Artifact download APIs  
- Binary storage buckets owned by TCMS CI/CD domain  
- Streaming log content  
- Retention enforcement jobs (metadata only)

---

## Related

[Canonical Pipeline Model](./APZHUB-APZ-TCMS-Canonical-Pipeline-Model.md) · [CI/CD Integration Architecture](./APZHUB-APZ-TCMS-CICD-Integration-Architecture.md)
