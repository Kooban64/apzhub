# Event-Driven Intake

Authorised: observe.alert.* · support.request.* / article / sla_warning.

Validates type/version/tenant, derives intent via policy, deterministic idempotency `evt:{eventId}:{envelopeId}`, rejects unauthorised/malformed, replay-safe. Does not mutate Observe/Support domain state.
