# Testing Search Mapping Guide

**Package:** `@apzhub/search-testing` **0.1.1** · **Milestone:** APZSEARCH-013

## Source models

From `@apzhub/testing-contracts` (and reporting types re-exported there). No Meilisearch, persistence, or platform-services imports.

Domain mappers under `src/mapper/{manual,automation,certification,release,engineering-intelligence,quality,reporting-metadata,pipeline}.ts` own the mapping; facade `TestingSearchEntityMapper` composes them.

## Common draft fields

| Search field | Source |
| ------------ | ------ |
| entityId | Canonical TCMS id |
| entityType | Local Testing search type |
| productId | `testing` (via context) |
| title / summary | name/title/label + description/summary when present |
| classification | Mapped status/severity + context; never downgrade |
| permissions | Trusted context tokens |
| tenant / organisation | Context + entity `tenantId` match |
| timestamps / version | Audit fields / versionNumber when present |
| navigationTarget | `/workspace/testing/...` |

## Representative mappings

| Entity type | Canonical model | Notes |
| ----------- | --------------- | ----- |
| `test_case` | `TestCase` | Primary discovery entity |
| `test_plan` / `test_suite` | `TestPlan` / `TestSuite` | Structure |
| `test_execution` | `ManualExecution` | Execution instance |
| `test_run` | `TestRun` | Run aggregate |
| `execution_step` | `TestStep` + extras | Requires parent tenant/classification |
| `evidence` | `Evidence` | Metadata only — presence flags, never `storageRef` |
| `approval` / `certification_approval` | `Approval` | Subject kind/id metadata |
| `requirement` / `defect` | `Requirement` / `DefectLink` | Framework-declared types |
| `automation_run` | `AutomationRun` | No credentials |
| `imported_result` | `AutomationImport` | No payload / checksum fingerprint |
| `coverage_summary` | `AutomationCoverageSnapshot` | Automation aggregates |
| `certification` | `CertificationRecord` | Gates/decisions via related types |
| `release*` | Release governance models | Names/labels/status only |
| `engineering_snapshot` | `EngineeringSnapshot` | **Engineering Score** uses this type |
| `engineering_trend` / `benchmark` / `historical_snapshot` / `risk_summary` | EI models | Snapshot metadata |
| `quality_summary` | `QualitySummary` | Id/tenant via extras or snapshot |
| `quality_coverage_summary` | `CoverageMetric` | Quality coverage snapshot metadata |
| `defect_summary` | Thin input or `DefectLink` meta | Never provider defect payload / URL |
| `report_metadata` | `ReportGenerationMetadata` | Never report binary body |
| `report_template` | `ReportTemplate` | Template catalogue |
| `pipeline` | `Pipeline` | Status/key/providerKind; secrets presence only |
| `pipeline_run` | `PipelineRun` | Status/counts/timestamps; never logs/artifacts/secrets |
| `pipeline_import` | `PipelineImport` | Status/timestamps; never checksum/payloadFingerprint |

## Searchable allowlist

Names, titles, summaries, descriptions, user-facing keys/ids, tags, release/certification/benchmark names, quality labels, pipeline status metadata.

## Never mapped

Evidence contents, uploads, attachments, screenshots, logs, raw automation/pipeline artifacts, credentials, CI secrets, report file bodies, provider metadata, database-only internals, pipeline stages/jobs payloads, checksum hex, payload fingerprints.
