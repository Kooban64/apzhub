# Alert Domain Model

Canonical types remain in `@apzhub/observe-contracts`:

- `AlertDefinition` / `AlertState`
- Severities: `info` | `warning` | `critical`
- States: `inactive` | `pending` | `firing` | `resolved` | `silenced`
- Categories (ADR-0070): `platform_health` | `component` | `capacity` | `security` | `integration` | `custom`

Phase A rule config: `AlertDefinition.metadata.rule` (`ObserveAlertRuleConfig`).  
Lifecycle metadata: `AlertState.metadata.lifecycle` (`ObserveAlertLifecycleMetadata`).
