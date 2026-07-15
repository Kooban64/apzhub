# APZHUB Testing (APZ TCMS) Search Publication Adapter Architecture

**Milestone:** APZSEARCH-013  
**Package:** `@apzhub/search-testing` **0.1.0**  
**Date:** 2026-07-15

---

## Purpose

Enable APZ TCMS to publish **metadata-only** canonical searchable entities into `@apzhub/search-integration`.

APZ TCMS remains System of Record for manual testing, automation ingestion, certification, release governance, engineering intelligence, report metadata, pipeline metadata, quality intelligence, execution history, approvals, and evidence **metadata**.

Search remains a derived discovery capability.

TCMS never:

- calls Meilisearch or Search Platform internals;
- constructs provider-specific documents;
- bypasses the Search Integration Framework;
- publishes binary evidence, report bodies, logs, screenshots, CI credentials, or storage refs;
- downgrades classifications or broadens visibility.

---

## Flow

```text
APZ TCMS Platform Services / `@apzhub/testing-contracts`
        ↓
TCMS Search Publication Adapter (@apzhub/search-testing)
        ↓
Search Integration Framework (@apzhub/search-integration)
        ↓
(future) Search Platform → Provider Resolver → Meilisearch Adapter → Meilisearch
```

This milestone terminates at the Search Integration Framework.

---

## Entity types (34)

| Area | Types |
| ---- | ----- |
| Manual | `test_plan`, `test_suite`, `test_case`, `test_execution`, `test_run`, `execution_step`, `evidence`, `approval`, `requirement`, `defect` |
| Automation | `automation_run`, `automation_suite`, `imported_result`, `coverage_summary` |
| Certification | `certification`, `certification_gate`, `certification_approval`, `certification_evidence`, `certification_decision` |
| Release | `release`, `release_candidate`, `release_package`, `release_scope`, `release_approval`, `release_decision`, `release_manifest`, `release_summary` |
| Engineering | `engineering_snapshot`, `engineering_trend`, `benchmark`, `historical_snapshot`, `risk_summary` |
| Reporting metadata | `report_metadata`, `report_template` |

Local catalogue may exceed the framework’s declarative product contract (`test_case` / `test_run` / `requirement` / `defect`) — same pattern as Documents.

---

## Components

`TestingSearchPublisher` · `TestingSearchEntityMapper` · `TestingSearchEntityValidator` · `TestingSearchPublicationContext` · `TestingSearchLifecycle` · `TestingSearchDiagnostics` · `TestingSearchMetrics` · `TestingSearchLogger` · `TestingSearchErrorTranslator` · `createTestingSearchPublisher()` / `*ForTest` · explicit lifecycle hooks.

---

## Security boundary

- Safe-metadata **allowlist** (`TESTING_SEARCH_SAFE_METADATA_KEYS`).
- Reject storage / credential / payload-fingerprint leakage.
- Classification fail-closed (default **confidential**); never downgrade vs context.
- Tenant / organisation from trusted publication context.
- Production factories require explicit sink / integration publisher.

---

## Explicit exclusions

Reporting **product** publication adapter (APZSEARCH-014), Search Platform / SDK / Framework / Meilisearch / HTTP / Workbench changes, AI, OCR, semantic/vector search, workers, polling, Event Bus.
