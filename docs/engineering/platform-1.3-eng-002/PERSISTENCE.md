# Persistence

Uses existing PostgreSQL Observe SoR tables:

- `platform_observe_alert_definition`
- `platform_observe_alert_state`

Phase A stores rule + lifecycle in `metadata_json` — no competing store; no migration required for Phase A MVP.
