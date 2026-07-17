# Observability Capability Limitations Guide

**Milestone:** APZOBSERVE-004

## Always unavailable (current programme)

The Workbench displays non-blocking capability banners stating these are **not available**:

- Live metrics collection
- Live log ingestion
- Live trace ingestion
- Grafana integration
- Prometheus integration
- Loki integration
- OpenTelemetry integration
- AlertManager integration
- Alert notification delivery
- Incident execution workflows

Overview and Diagnostics also show **Provider execution: Unavailable**.

## What the Workbench is

- Metadata governance over the Observability Typed Client
- Management of definitions, recorded samples/states, references, maintenance windows, diagnostics readiness metadata

## What the Workbench is not

- Live Grafana / Prometheus / Loki / OTel / AlertManager UI
- PromQL / LogQL / live query surface
- Log viewer or distributed-trace visualiser
- Incident-response engine or alert delivery system
- Dashboard rendering / embedding engine

## Disabled service

When the HTTP API returns `503` with `OBSERVE_SERVICE_UNAVAILABLE`, the Workbench shows a controlled unavailable state (`data-testid="observability-unavailable"`) with safe user messaging — no stack traces or repository details.
