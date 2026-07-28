# ADR-0067: Metabase as Analytics Provider & Future Provider Abstraction

## Status

**Accepted** — APZHUB-PLATFORM-ANALYTICS-001 (2026-07-19)

## Context

OSS integration strategy selects Metabase CE for Wave 6 Analytics ([OSS Product Integration Catalog](../architecture/APZHUB-OSS-Product-Integration-Catalog.md)). No `integrations/metabase` package exists on disk. Embed/license risks are noted (OSS-T04). Platform must remain provider-replaceable (003/008) without leaking Metabase into modules or service interfaces.

## Decision

1. **Primary provider:** Metabase CE (self-hosted) for Analytics Platform BI execution and dashboard visuals.
2. **Integration form:** `@apzhub/integration-metabase` via Integration SDK **1.0.0** — capabilities for health, auth bridge, embed, diagnostics, error translation.
3. **Platform consumers** call Analytics Platform Services only — never Metabase clients outside the adapter.
4. **User experience:** Standard users never use Metabase login UI; embeds hosted in APZHUB Workbench; engine branding masked.
5. **Provider abstraction:** Service contracts speak dashboard/dataset/embed language; Metabase IDs remain connector-internal (011).
6. **Future providers:** Superset (or Owner-approved alternative) may be added as a second adapter behind the same Analytics Platform services without product redesign.
7. **Non-providers for Analytics Platform:** Grafana, Prometheus, Loki are **not** Analytics providers (Observability track). Power BI / external BI are product exclusions for Analytics 1.0.
8. **Implementation** of the Metabase adapter requires a **separate named Owner Approval** (roadmap P1) — this ADR does not authorise code.

## Consequences

- Unblocks architecture readiness condition C2 from APZ-ANALYTICS-001 upon Acceptance of APZHUB-PLATFORM-ANALYTICS-001.
- Legal/embed review remains a P1 prerequisite (OSS-T04).
- Analytics Platform can evolve multi-provider without changing APZ Analytics module contracts.
- Absence of Metabase on disk remains the primary integration blocker for Implementation Ready.

## Related

- [ADR-0066](./ADR-0066-analytics-platform-boundaries.md)
- [ANALYTICS-INTEGRATION-MODEL](../platform/analytics/ANALYTICS-INTEGRATION-MODEL.md)
- [ADR-0005 Integration SDK strategy](./ADR-0005-integration-sdk-strategy.md)
- [ADR-0065 Integration SDK freeze](./ADR-0065-integration-sdk-v1-architecture-freeze.md)
