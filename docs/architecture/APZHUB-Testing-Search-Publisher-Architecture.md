# APZHUB Testing Search Publisher Architecture

**Milestone:** APZSEARCH-013 (architecture completion)  
**Package:** `@apzhub/search-testing` **0.1.1**  
**Date:** 2026-07-15

---

## Purpose

Describe the specialised publisher architecture inside `@apzhub/search-testing`. The orchestrator routes by `entityType`; domain-owned mappers perform metadata-only mapping. No Meilisearch or Search Platform coupling.

---

## Layers

```text
TestingSearchPublisher (orchestrator)
        ↓ resolve by entityType
Specialised Domain Publishers (shared publication contract)
        ↓ domain mapper
SearchEntityDraft
        ↓
SearchIntegrationPublisher
```

---

## Orchestrator

`TestingSearchPublisher` coordinates only:

- Routes `publish` / `update` / `remove` / `validate` / `preview` to the specialised publisher that owns the entity type
- Owns cross-cutting lifecycle / diagnostics / statistics access
- Does **not** contain domain `map*` methods

Public factory API remains `createTestingSearchPublisher` / `createTestingSearchPublisherForTest`.

---

## Specialised publishers

Each implements `TestingDomainSearchPublisher` via `DomainSearchPublisherBase` (shared validate/publish/update/preview/remove pipeline + diagnostics):

| Publisher | Domain id | Entity types |
| --------- | --------- | ------------ |
| `ManualTestingPublisher` | `manual` | test_plan, test_suite, test_case, test_execution, test_run, execution_step, evidence, approval, requirement, defect |
| `AutomationPublisher` | `automation` | automation_run, automation_suite, imported_result, coverage_summary |
| `CertificationPublisher` | `certification` | certification, certification_gate, certification_approval, certification_evidence, certification_decision |
| `ReleasePublisher` | `release` | release, release_candidate, release_package, release_scope, release_approval, release_decision, release_manifest, release_summary |
| `EngineeringIntelligencePublisher` | `engineering_intelligence` | engineering_snapshot, engineering_trend, benchmark, historical_snapshot, risk_summary |
| `QualityPublisher` | `quality` | quality_summary, quality_coverage_summary, defect_summary |
| `ReportingMetadataPublisher` | `reporting_metadata` | report_metadata, report_template |
| `PipelinePublisher` | `pipeline` | pipeline, pipeline_run, pipeline_import |

Engineering Score is published as existing `engineering_snapshot` (`EngineeringSnapshot`).

---

## Domain mappers

Under `src/mapper/`:

- Shared helpers: classification, navigation, permission tokens (`shared.ts`)
- Domain classes: `manual`, `automation`, `certification`, `release`, `engineering-intelligence`, `quality`, `reporting-metadata`, `pipeline`
- Facade `TestingSearchEntityMapper` composes domain mappers for backwards-compatible `map()` / `map*` APIs

Specialised publishers own their domain mapper instance; the orchestrator never calls `map()` itself.

---

## Layout

```text
src/publisher/
  publication-contract.ts
  domain-search-publisher-base.ts
  testing-search-publisher.ts      # orchestrator
  manual-testing-publisher.ts
  automation-publisher.ts
  certification-publisher.ts
  release-publisher.ts
  engineering-intelligence-publisher.ts
  quality-publisher.ts
  reporting-metadata-publisher.ts
  pipeline-publisher.ts
  index.ts
```

---

## Security

Pipeline / quality / reporting / evidence mappings remain metadata-only: no logs, artifacts, secrets, credentials, provider storage IDs, checksum hex, payload fingerprints, or report bodies.

---

## Successor

APZSEARCH-014 — Reporting Search Publication Adapter (**not started**; stop here).
