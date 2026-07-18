# APZHUB Metrics KPI Guide

**Milestone:** APZMETRICS-001

## Principles

- KPIs **reference** Metrics; they do not store time-series values.
- KPI targets are **metadata** (period label + target value label). They are never executed in this foundation.
- Creating a KPI requires the referenced Metric to exist (domain integrity).

## Entities

- **KPI** — key, name, metricId, optional group/classification, lifecycle status
- **KPIGroup** — catalogue grouping
- **KPITarget** — periodLabel, targetValueLabel, optional unitId

## Out of scope

KPI calculation, dashboards, alerting, provider evaluation — deferred to future programmes.
