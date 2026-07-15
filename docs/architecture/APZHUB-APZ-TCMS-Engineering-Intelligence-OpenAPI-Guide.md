# APZHUB APZ TCMS — Engineering Intelligence OpenAPI Guide (APZTCMS-022)

## Spec

`docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`

Tag: **Testing Engineering Intelligence**

## Paths

- `/testing/engineering-intelligence/score`
- `/testing/engineering-intelligence/health`
- `/testing/engineering-intelligence/risk`
- `/testing/engineering-intelligence/snapshots`
- `/testing/engineering-intelligence/snapshots/{snapshotId}`
- `/testing/engineering-intelligence/trends`
- `/testing/engineering-intelligence/benchmarks`
- `/testing/engineering-intelligence/baselines`
- `/testing/engineering-intelligence/historical`

## Request schemas

- `EngineeringIntelligenceScopeRequest`
- `EngineeringIntelligenceTrendBuildRequest`
- `EngineeringIntelligenceBenchmarkCompareRequest`

## Validate

```bash
pnpm openapi:validate:platform
```
