# APZHUB APZ TCMS — Canonical Pipeline Model

**Milestone:** APZTCMS-015  
**Source of truth (types):** `packages/testing-contracts/src/domain/cicd-pipeline.ts`

---

## Principle

External provider payloads are normalized into **canonical** models. Nested execution detail (stages, jobs, steps, artifacts, approvals, events) is stored as structured metadata. APZ TCMS never stores binary artifact content.

---

## Core entities

| Model                     | Role                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------ |
| **Pipeline**              | Registered pipeline definition (key, provider, external ref, status active/archived) |
| **PipelineImport**        | One ingestion batch (SoR for import lifecycle, fingerprint, checksum, snapshot)      |
| **PipelineRun**           | Normalized run linked to pipeline + import                                           |
| **PipelineImportHistory** | Append-only import history events                                                    |

---

## Nested / supporting models

| Model                                              | Notes                                                                              |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| PipelineStage                                      | Ordered stage metadata; may contain jobs                                           |
| PipelineJob                                        | Job metadata; may contain steps                                                    |
| PipelineStep                                       | Step metadata; log refs only                                                       |
| ArtifactReference                                  | Name, size, type, checksum, storage provider, URI ref, retention — **no download** |
| PipelineEnvironment                                | Branch, commit, OS, build number, etc.                                             |
| PipelineApproval                                   | technical \| qa \| security \| business \| operations — metadata only              |
| PipelineResult / CanonicalPipelineResult           | Adapter parse output envelope                                                      |
| PipelineSummary                                    | Headline + overall status + warnings/failures/retries                              |
| PipelineLogReference                               | URI/size/checksum — never log bodies                                               |
| PipelineVariable                                   | Name/metadata — never secret values                                                |
| PipelineSecretReference                            | Name + opaque reference only                                                       |
| PipelineTrigger                                    | Trigger kind / actor / reason                                                      |
| PipelineSource                                     | Repository / branch / commit / PR                                                  |
| PipelineEventRecord                                | Internal events (queued, running, passed, …) — **not** Event Bus                   |
| PipelineStatus                                     | Status snapshot helper                                                             |
| PipelineMetrics / PipelineDuration / PipelineQueue | Timing and counts                                                                  |
| PipelineFailure / PipelineWarning / PipelineRetry  | Structured outcome detail                                                          |
| PipelineLinks                                      | Refs to automation, coverage, executions, release, certification, evidence         |

---

## Status vocabulary

Canonical run statuses include: `queued`, `running`, `passed`, `failed`, `cancelled`, `skipped`, `timed_out`, `unknown` (see enums in contracts).

Import statuses include: `pending`, `validating`, `importing`, `completed`, `failed`, `duplicate`, `corrected`.

---

## Evidence & release linkage

`PipelineLinks` on a run may reference:

- automation import id
- coverage metric ids
- execution session ids
- release id
- certification record id
- evidence ids

References only — no binary payload transfer.

---

## Related

[CI/CD Integration Architecture](./APZHUB-APZ-TCMS-CICD-Integration-Architecture.md) · [Artifact Metadata Guide](./APZHUB-APZ-TCMS-Artifact-Metadata-Guide.md)
