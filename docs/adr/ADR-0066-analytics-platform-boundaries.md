# ADR-0066: Analytics Platform Boundaries (vs Observability, Metrics, Reporting)

## Status

**Accepted** — APZHUB-PLATFORM-ANALYTICS-001 (2026-07-19)

## Context

APZ-ANALYTICS-001 (**ACCEPTED**, READY WITH CONDITIONS) identified missing shared Analytics Platform capability. The repository already has frozen **Metrics** (APZMETRICS-006) and **Observability** (APZOBSERVE-006) metadata SoRs, plus **Reporting** (APZREPORT-003). Confusing these with product BI/dashboards risks architectural defects and freeze violations.

Evidence:

- Metrics freeze explicitly excludes “Analytics / reporting / dashboards” and Prometheus/Grafana integrations
- Observability SoR is metadata governance — Grafana/Prometheus/Loki adapters **absent**
- OSS catalogue Wave 6 plans Metabase → Analytics via `AnalyticsService` + adapter
- Domain analytics (e.g. `SupportAnalyticsService`, Plane adapter analytics) are not the suite Analytics Platform

## Decision

1. Establish a distinct **Analytics Platform** capability for governed BI dashboards and embeds under APZHUB branding.
2. **Analytics ≠ Observability** — Observability owns ops telemetry metadata/health hierarchy; Analytics does not become Grafana/Prometheus productisation.
3. **Analytics ≠ Metrics SoR** — Metrics owns metric definition/governance metadata; Analytics may _display_ curated summaries or deep-link to Metrics Workbench but must not execute Metrics formulas or scrape providers.
4. **Analytics ≠ Reporting SoR** — Reporting owns report placeholders / TCMS reporting artefacts; Analytics owns dashboard registry + BI embeds. Cross-links allowed; SoR merge forbidden.
5. **Business Intelligence / Dashboards** for suite decision support live under Analytics Platform (+ APZ Analytics product).
6. **Operational / repository reporting** remain Reporting or domain services unless explicitly curated into Analytics catalogues.
7. Request path remains Module → Gateway → Authz → Analytics Platform Services → Integration Adapter → Engine.
8. Frozen Metrics / Observability / Reporting / Integration SDK packages are **not** redesigned by Analytics; changes require their own ADR + Owner.

## Consequences

- Clear ownership for future Metabase work and APZ Analytics product.
- Prevents accidental implementation inside Metrics/Observe Workbenches.
- Requires new contracts/services/HTTP under Analytics (future programmes) — not reuse of `gateway.metrics.*` for BI embeds.
- Companion [ADR-0067](./ADR-0067-metabase-analytics-provider.md) selects Metabase as first provider.

## Related

- [Analytics Platform](../platform/analytics/ANALYTICS-PLATFORM.md)
- [Metrics Freeze Notice](../architecture/APZHUB-Metrics-Architecture-Freeze-Notice.md)
- [APZ-ANALYTICS-001 pack](../products/apz-analytics/README.md)
- [OSS Product Integration Catalog — Wave 6](../architecture/APZHUB-OSS-Product-Integration-Catalog.md)
