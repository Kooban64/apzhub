# APZHUB Reporting Template Engine

**Milestone:** APZTCMS-024

## Responsibility

The template engine (`packages/testing-services/src/reporting/template-engine.ts`) binds **pre-computed** `ReportParameters` to `ReportTemplate` definitions. It performs string substitution and structural assembly only — no business calculations.

## Template structure

Templates declare:

- Title, subtitle, header, footer, branding, metadata, version, revision
- Sections with block blueprints: heading, paragraph, metric (`valueKey`), table (`tableKey`), list (`listKey`), summary (`summaryKey`)

String fields may contain `{{path}}` placeholders resolved from `parameters.text`, `parameters.metadata`, and `parameters.metrics` (stringified).

## Binding rules

| Block kind | Source |
|------------|--------|
| metric | `parameters.metrics[valueKey]` — passed through as string |
| table | `parameters.tables[tableKey]` — empty table if missing (warning) |
| list | `parameters.lists[listKey]` — empty list if missing (warning) |
| summary | `parameters.summaries[summaryKey]` — empty if missing (warning) |
| heading/paragraph | placeholder resolution only |

## Validation

`validateTemplateBinding` checks output format support and required metric keys. Missing tables/lists/summaries produce warnings; missing metrics produce errors.

## Built-in catalogue

Fourteen production templates in `templates/builtin-templates.ts` — one per `ReportType`. Custom templates register via `registerTemplate` (persisted, `builtin: false`). Built-in IDs cannot be overwritten.

## No embedded business logic

Callers (future orchestrators in domain services) must supply all display values. The engine never reads SoR aggregates or recomputes scores.
