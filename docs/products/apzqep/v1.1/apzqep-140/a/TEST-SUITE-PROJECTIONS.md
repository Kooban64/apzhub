# Test Suite Projections — APZQEP-140-A

## QKI

Projection id: `qep.knowledge.suite.v1`  
Entity kind: `suite`  
Builder: `buildSuiteProjection` in `@apzhub/qep-knowledge-index`

Search consumes suite projections only — do not query Suite Application Services for discovery.

## Notifications (S12)

Templates for published / archived / retired. Processors are subscribers, not callers.

## Commands (S13)

Registered:

- `qep.command.navigate.suites`
- `qep.command.suite.create`
- `qep.command.suite.open` (entity discovery via QKI)
