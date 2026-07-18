# APZHUB Platform Dependency Model

**Milestone:** APZTCMS-014

## Edges

Each `ProductDependency` records:

- `fromProductId` / `toProductId`
- `relation`: `upstream` | `downstream`
- `requirement`: `required` | `optional`
- `blocked`: boolean

## Validation

`DependencyGraphService.validate` returns:

- missing required dependencies (out of evaluated scope)
- blocked dependency IDs
- cycle detection (DFS)
- messages + `computedAt`

## Health

`healthForProduct` returns upstream/downstream/required/optional/blocked counts and readiness `READY` | `READY_WITH_WARNINGS` | `NOT_READY`.

No deployment engine.
