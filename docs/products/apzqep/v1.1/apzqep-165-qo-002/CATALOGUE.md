# CATALOGUE — QO-002

`CapabilityRegistry` provides:

- register / get / list / count
- query by lifecycle, provider, trigger type, Quality Flow stage, contract id, health, contract version
- reportHealth (stored status only — no live probing)
- transitionLifecycle for catalogue lifecycle states
- `catalogueMode: "catalogue-only"` guardrail

Explicitly absent: invoke, execute, resolve, getService, getInstance, run.
