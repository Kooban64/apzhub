# AUTOMATION-ARCHITECTURE

| Field     | Value                     |
| --------- | ------------------------- |
| Programme | APZQEP-160                |
| Timestamp | 20260803T141613Z          |
| Stream    | A — Enterprise Automation |

## Intent

APZQEP orchestrates automation; it does not become “the Playwright product.” Runners are pluggable engines behind a **Runner Abstraction**.

## Layers

```text
Workbench / Commands
        ↓
Platform Services (orchestration, authz, audit, events)
        ↓
Automation Orchestrator (suite selection, scheduling, parallelism)
        ↓
Runner Providers (Playwright · API · k6 · A11y · Visual · Security · Manual)
        ↓
Evidence Publisher → Evidence Engine
```

## Playwright (Wave 1 priority)

| Capability         | Notes                          |
| ------------------ | ------------------------------ |
| Browser management | Project-scoped configs         |
| Projects / workers | Parallel execution             |
| Artefacts          | Screenshots, videos, traces    |
| Resilience         | Retries, flaky detection       |
| Evidence           | Bound to runs, correlation IDs |

## API testing

REST · GraphQL · gRPC · OpenAPI validation · contract testing — via provider model.

## Performance (k6)

Load · stress · soak · spike · baselines — results normalised into quality data model.

## Accessibility / Visual / Security

axe-core / WCAG reports · screenshot comparison + approval · security scan adapters — evidence-first.

## Rules

1. No runner logic in UI modules.
2. Connectors/adapters own engine protocols.
3. Failures produce evidence + events, not silent UI-only errors.
