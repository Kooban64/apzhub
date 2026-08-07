# Completion — APZ-WORKFLOW-NATIVE-001-N02

| Field     | Value                       |
| --------- | --------------------------- |
| Slice     | APZ-WORKFLOW-NATIVE-001-N02 |
| Status    | **COMPLETE**                |
| Timestamp | 20260805T164500Z            |

## Outcomes

- **G-12 / G-13 CLOSED** — Workflow UI consumes APZHUB session permissions; no hard-coded `workflow.*` default
- Product Board Business Process Language principle **IN FORCE** before N-02
- Product vocabulary law recorded — Process / Stage / Step / … vs Run / Engine / Provider / …
- Tenant Member seeded with **business-process** grants only (no engine / admin / runs / schedules)
- Workflow Engine Activity Bar gated on `workflow.admin`
- Runtime runs / schedules / health / diagnostics / capabilities / notifications gated on operator identity
- `workflow.view` no longer implies execution or engine surfaces
- No second login · no engine roles · no architecture change · no N-03 chrome redesign
- Playbook unchanged · Lane 1 unchanged

## Explicitly deferred to N-03

- Rename chrome to Process / Stage / Step / Outcome language
- Consolidate three Activity Bar planes into one APZ Workflow product surface
- Business journey catalogue (onboarding, procurement, …)
- Backbone glue UX across RI #001–#004

## Recommendation

Proceed to **APZ-WORKFLOW-NATIVE-001-N03 — Native APZHUB Product Experience** when Owner authorises — that slice carries business-process vocabulary into the full user experience without changing architecture or Playbook.
