# Audit and Events

Every command appends an audit entry (`qep.requirement_baseline.created`,
`.updated`, `.item_added`, `.item_removed`, `.locked`, `.archived`, `.compared`,
`.integrity_verified`, `.integrity_verification_failed`) and publishes a matching
domain event (`BaselineCreated`, `BaselineItemAdded`, `BaselineItemRemoved`,
`BaselineLocked`, `BaselineArchived`, `BaselineCompared`,
`BaselineIntegrityVerified`). Audit and event publication happen after the
repository write inside the same command; a failing downstream hook
(`onBaselineUpserted`, search indexing) is isolated so it cannot corrupt or roll
back the already-persisted baseline. Audit and events are append-only and
platform-owned, consistent with Document 012 — modules/services never notify or
index directly.
