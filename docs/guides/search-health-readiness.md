# Search Health and Readiness Guide

> **Milestone:** APZSEARCH-003

## Health states

`AVAILABLE` · `DEGRADED` · `UNAVAILABLE` · `UNKNOWN`

## Differentiation

| Kind | Meaning in APZSEARCH-003 |
|------|--------------------------|
| Management-plane readiness | Persistence + registry + services registered |
| Provider lifecycle readiness | Stub/managed provider lifecycle probes |
| Search-execution readiness | **Always unavailable / false** until a real engine adapter exists |

Do not mark metadata-only stub providers as execution-AVAILABLE.
