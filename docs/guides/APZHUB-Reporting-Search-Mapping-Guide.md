# APZHUB Reporting Search Mapping Guide

**Package:** `@apzhub/search-reporting` · **Milestone:** APZSEARCH-014

## productId

Always `"reporting"` via `toSearchIntegrationContext`.

## ReportTemplate

Publish: `id`, `title`/`name`, `description`, `reportType`, `version`, `revision`, `builtin`, safe metadata allowlist keys.

**Omit:** `sections`, `header`, `footer`, `branding`, subtitle body content used as rendered payload.

## ReportGenerationMetadata

Publish: reportType, outputFormat, templateId, requestId, byteLength, **checksumPresent** (boolean string), preview, version, revision, generatedAt/By, archivedAt.

**Never:** `parametersJson` values, `checksumSha256` hex, rendered bodies.

Synthesize title when missing: `` `${reportType} report (${outputFormat})` ``.

## report_output_metadata

Derived companion entity (`entityId` = `output:{generationId}`) with outputFormat, byteLength, checksumPresent only.

## Thin catalogue entities

Category / placeholder / definition / type / profile / consumer / usage summary use thin local inputs (see architecture doc). Placeholder catalogues accept **labels only**.

## Classification

`resolveReportingClassification(context, extras)` — fail-closed confidential; `neverDowngrade` default true.
