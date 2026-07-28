# Observability — APZQEP-ENG-050B

## Hooks

| Hook                                 | Purpose                                                        |
| ------------------------------------ | -------------------------------------------------------------- |
| `onObservation`                      | Operation name, durationMs, outcome                            |
| Structured domain/application errors | Typed codes (`NOT_FOUND`, `CONFLICT`, `REVISION_CONFLICT`, …)  |
| Platform gateway health              | QEP readiness surface includes specifications persistence mode |

## Standards

Uses Platform observability conventions. No bespoke metrics subsystem inside the package. Tracing/correlation IDs flow via `QepRequestContext.correlationId`.
