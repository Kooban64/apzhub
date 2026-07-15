# Search Domain-to-Platform Boundary Guide

> **Milestone:** APZSEARCH-003

## Permitted

```text
PlatformServiceGateway → Search platform services → Search persistence / registry → repositories
```

## Prohibited

- Gateway → Search repositories / PostgreSQL directly
- Platform services → engine SDKs
- search-persistence → platform-services
- search-contracts → persistence
- HTTP routes / Workbench / product modules managing persistence directly
- Search execution hidden inside validation or diagnostics
- Copying product SoR data into search metadata as an index
