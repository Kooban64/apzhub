# APZHUB Metric Governance Guide

**Milestone:** APZMETRICS-001

## Ownership

Platform Metrics owns metric definitions, taxonomy, catalogue, metadata, KPIs, dimensions, labels, units, thresholds, aggregation/retention/ownership metadata, lifecycle, versioning, and classifications.

## Rules

1. **Immutable identity** — `Metric.key` cannot change after create.
2. **Unique keys** — metric keys are unique per tenant.
3. **Version control** — `MetricVersion` records govern evolution; definitions attach to metrics.
4. **Lifecycle managed** — fail-closed transitions (`draft` → `active`/`archived`; `active` → `inactive`/`archived`; `inactive` → `active`/`archived`; `archived` terminal).
5. **Dependencies** — both ends must exist; self-dependencies forbidden.
6. **Formulas / thresholds / KPI targets** — stored as metadata only; never evaluated here.
7. **Credentials** — credential-like metadata keys are rejected.
8. **Tenant isolation** — all repository operations are tenant-scoped; PostgreSQL RLS required in production.

## Consumers

Observability, Analytics, Reporting, AI, and Workflow consume Metrics. Providers implement Metrics — they do not own the SoR.
