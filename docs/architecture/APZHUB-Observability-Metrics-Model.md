# Observability Metrics Model

**Milestone:** APZOBSERVE-001

## MetricDefinition

Catalogue metadata: key, name, kind (`counter` | `gauge` | `histogram` | `summary` | `unknown`), unit, labels, provider kind/ref, lifecycle status.

## MetricSample

Reference metadata pointing at a definition and sample time. **Not** Prometheus time-series storage.

## Provider kinds (metadata)

`prometheus` · `loki` · `grafana` · `opentelemetry` · `alertmanager` · `internal` · `unknown`

Provider implementations are out of scope for APZOBSERVE-001.
