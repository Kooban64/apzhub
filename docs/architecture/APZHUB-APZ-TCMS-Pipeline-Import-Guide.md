# APZHUB APZ TCMS — Pipeline Import Guide

**Milestone:** APZTCMS-015  
**Domain:** `packages/testing-services/src/pipelines/`

---

## Import services (no polling / no schedulers)

| Operation                                              | Purpose                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| `registerPipeline`                                     | Register pipeline definition metadata                         |
| `synchroniseMetadata`                                  | Update pipeline metadata from provider info (caller-supplied) |
| `importRun`                                            | Parse payload → canonical → persist import + run              |
| `importExecutionSummary`                               | Upsert/update summary/metrics for an external run ref         |
| `linkArtifacts`                                        | Attach artifact **references** to a run                       |
| `linkEvidence` / `linkCertifications` / `linkReleases` | Cross-domain refs only                                        |
| `updatePipeline`                                       | Mutate registered pipeline fields                             |
| `archivePipeline`                                      | Soft-archive pipeline                                         |

All operations are **on-demand** through the gateway. No background workers, pollers, or cron schedulers in this milestone.

---

## Import flow

```text
Caller payload
  → resolve PipelineResultAdapter (kind or canParse)
  → parse (provider → canonical)
  → normalize + validate
  → duplicate detection (provider + externalRunRef / fingerprint)
  → persist PipelineImport + PipelineRun + history
  → optional link* operations
```

Duplicates may return the existing import when `allowDuplicateReturn` is set; otherwise import status `duplicate` / rejection per domain rules.

---

## Gateway entry points

`gateway.testing.pipelines`:

- register / update / archive / get / list pipelines
- importRun / listImports / getImport / listImportHistory
- getRun / listRuns / listStages / listJobs
- linkArtifacts / linkEvidence / linkCertifications / linkReleases / getLinks
- listProviders

---

## Permissions

| Permission                      | Use                                   |
| ------------------------------- | ------------------------------------- |
| `pipeline.read`                 | Read pipelines, runs, stages, jobs    |
| `pipeline.import`               | Register, import, synchronise, update |
| `pipeline.archive`              | Archive pipelines                     |
| `pipeline.audit`                | Import history / audit reads          |
| `pipeline.providers`            | List registered adapters              |
| `pipeline.link`                 | Cross-domain linking                  |
| `pipeline.admin` / `pipeline.*` | Broad administration within TCMS      |

No administration UI in this milestone.

---

## Related

[Provider Contract Guide](./APZHUB-APZ-TCMS-Provider-Contract-Guide.md) · [Developer Guide](./APZHUB-APZ-TCMS-CICD-Developer-Guide.md)
