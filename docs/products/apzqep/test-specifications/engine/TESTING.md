# Testing — APZQEP-ENG-050B

## Suites

| Suite | Coverage |
| ----- | -------- |
| Domain unit tests | Aggregate, lifecycle, policies, VOs |
| Architecture boundary tests | Domain purity; infra/application layering |
| In-memory repository contract | CRUD, concurrency, versions, relationships |
| Postgres repository (mocked executor) | Persist paths, revision conflict, unique violation |
| Application service | Permissions, lifecycle, search, supersede, hooks |
| Available actions / DTO adapter | Projection correctness |
| Platform gateway smoke | create → review → approve |

## Targets (package)

| Metric | Result |
| ------ | ------ |
| Line / statement | **~99%** |
| Function | **100%** |
| Branch | **~91%** |

## Command

```bash
pnpm --filter @apzhub/qep-test-specifications test
pnpm --filter @apzhub/qep-test-specifications typecheck
```
