# Analytics Platform Services — Release Notes

## 0.1.0 — 2026-07-19 (APZHUB-PLATFORM-ANALYTICS-004)

### Added

- Analytics Platform Services in `@apzhub/platform-services` **0.27.0**
- `services/analytics/service.yaml` **0.1.0**
- `*ServiceImpl` for all Analytics contract ports
- Metabase ops provider + mock ops + in-memory registry
- Gateway facet `gateway.analytics`
- AuthZ catalogue + operation map entries
- Unit, mock, and Metabase mock integration tests

### Changed

- `@apzhub/analytics-contracts` — additive `analytics.kpi.view` / `viewKpi` operation
