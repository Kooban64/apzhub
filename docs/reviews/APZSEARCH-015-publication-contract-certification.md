# APZSEARCH-015 — Publication Contract Certification

**Date:** 2026-07-15  
**Status:** **PASS**

---

## Contract surface (all products)

| Operation | Purpose |
| --------- | ------- |
| `publish` | Accept validated canonical draft into publication sink |
| `update` | Update previously published entity |
| `remove` | Soft-remove / tombstone from sink |
| `validate` | Fail-closed local + framework validation |
| `preview` | Redacted dry-run draft |
| `diagnostics` | Product diagnostics snapshot |
| `lifecycle` | Lifecycle transition via framework |
| `statistics` | In-process publication metrics |

## Factory patterns

| Product | Production factory | Test factory |
| ------- | ------------------ | ------------ |
| Projects | `createProjectsSearchAdapter` | (defaults to in-memory framework) |
| Support | `createSupportSearchAdapter` | (defaults to in-memory framework) |
| Documents | `createDocumentsSearchAdapter` (explicit sink required) | `createDocumentsSearchAdapterForTest` |
| Testing | `createTestingSearchAdapter` (explicit sink required) | `createTestingSearchAdapterForTest` |
| Reporting | `createReportingSearchAdapter` (explicit sink required) | `createReportingSearchAdapterForTest` |

## Evidence

- Static audit scans `publisher/*.ts` for all eight operations
- Harness `apzsearch-015-contract-conformance.test.ts` instantiates each publisher and asserts methods on instance/prototype
- Framework smoke: `createSearchIntegration().publisher.publish(...)` for product `projects`

## Limitations

Lifecycle hooks exist as explicit callables; Platform Service wiring deferred. Journals are in-memory until APZSEARCH-016 indexing orchestration.
