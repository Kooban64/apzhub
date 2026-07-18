# APZHUB Reporting Search Publication Lifecycle Guide

**Package:** `@apzhub/search-reporting` · **Milestone:** APZSEARCH-014

## Operations

`publish` · `update` · `remove` · `validate` · `preview` · `diagnostics` · `lifecycle` · `statistics`

## Domain → Search lifecycle suggest

| Domain marker               | Search lifecycle |
| --------------------------- | ---------------- |
| preview / draft             | `draft`          |
| active / published / ready  | `validated`      |
| archived                    | `archived`       |
| deleted / removed / expired | `removed`        |

Generation/output entities treat `preview` as `draft`.

## Hooks

Explicit callable hooks only (`createReportingSearchLifecycleHooks`). No Event Bus, workers, polling, or automatic report generation.

`onReportGenerationRecorded` publishes primary `report_generation_metadata` plus companion `report_output_metadata`.

Removals use framework `remove` only — never invent lifecycle transitions that skip the sink.
