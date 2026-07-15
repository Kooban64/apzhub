# Testing Search Publication Lifecycle Guide

**Milestone:** APZSEARCH-013

## Operations

`publish` · `update` · `remove` · `validate` · `preview` · `diagnostics` · `lifecycle` · `statistics`

No execution, orchestration, workers, or polling.

## Explicit hooks (callable only)

Test plan/suite/case upsert/remove · execution/run upsert · evidence/approval upsert · requirement/defect upsert · automation run/suite/import/coverage · certification + gates/approvals/evidence/decisions · release family · engineering snapshot/trend/benchmark/historical/risk · report metadata/template.

No Event Bus, HTTP handlers, Workbench wiring, or Platform Service auto-hooks in this milestone.

## Domain status → Search lifecycle (suggest)

| Domain status (examples) | Suggested Search lifecycle |
| ------------------------ | -------------------------- |
| draft / pending / queued / planned | draft |
| active / passed / approved / certified / ready / completed / released / published | validated |
| archived / retired / expired | archived |
| deleted / removed / cancelled / withdrawn / rejected | removed |

Immutable snapshot types (`historical_snapshot`, `release_manifest`, `report_metadata`) prefer **validated** when active.

Actual transitions go through `SearchIntegrationPublisher`.
