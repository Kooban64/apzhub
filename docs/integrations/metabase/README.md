# Metabase Integration

> **Package:** `@apzhub/integration-metabase` **0.1.0**  
> **Programme:** APZHUB-INTEGRATION-METABASE-001  
> **SDK:** `@apzhub/integration-sdk` **1.0.0**  
> **Status:** **ACCEPTED / CLOSED** — **CERTIFIED_FOUNDATION**  
> **Provider:** Canonical Analytics Platform provider (ADR-0067)

## Documents

| Document              | Path                                                   |
| --------------------- | ------------------------------------------------------ |
| Certification         | [CERTIFICATION-REPORT.md](./CERTIFICATION-REPORT.md)   |
| Compatibility Matrix  | [COMPATIBILITY-MATRIX.md](./COMPATIBILITY-MATRIX.md)   |
| Capability Assessment | [CAPABILITY-ASSESSMENT.md](./CAPABILITY-ASSESSMENT.md) |
| Known Limitations     | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)         |
| Release Notes         | [RELEASE-NOTES.md](./RELEASE-NOTES.md)                 |
| Operational Readiness | [OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md) |

## Scope (foundation)

- MetabaseAdapter · MetabaseClient · factory / bootstrap
- Authentication (`api_key` · `session`) via SecretProvider
- Connection management · health · diagnostics
- Version detection · capability/feature detection
- Metrics · logging · error translation
- Readiness classification · capability / provider registration
- Mock provider · unit / mock / integration tests

## Explicitly out of scope

Analytics Contracts · Analytics Platform Services · HTTP APIs · Workbench · APZ Analytics product · embed token issuance · custom SQL · report designer

## Architecture

```text
(future) Analytics Platform Services → MetabaseAdapter → MetabaseClient → Metabase CE /api
```

Modules and UI never call this adapter or Metabase directly (008 / 009 / 010).
