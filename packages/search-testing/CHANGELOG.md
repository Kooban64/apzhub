# Changelog — `@apzhub/search-testing`

## 0.1.1 — 2026-07-15

- Specialised domain publishers under `TestingSearchPublisher` orchestrator (Manual, Automation, Certification, Release, Engineering Intelligence, Quality, Reporting Metadata, Pipeline).
- Domain mappers split under `src/mapper/`; facade `TestingSearchEntityMapper` remains for compatibility.
- New entity types: `quality_summary`, `quality_coverage_summary`, `defect_summary`, `pipeline`, `pipeline_run`, `pipeline_import`.
- Audit requires specialised publisher classes and forbids domain `map*` methods in the orchestrator file.
- Public `createTestingSearchPublisher` / `*ForTest` API preserved.

## 0.1.0 — 2026-07-15

- Initial APZSEARCH-013 Testing Search Publication Adapter.
