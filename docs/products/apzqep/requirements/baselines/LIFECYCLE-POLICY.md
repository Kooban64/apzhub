# Lifecycle Policy

The domain policy permits only `draft → locked → archived`. It rejects all
reverse and skip transitions, including unlock and archive-from-draft.

The factory always creates a draft. Metadata and membership policies require that
state explicitly. Locking and archiving record their actor/time in the aggregate
state.

Parts 2–3 add the enforcement path: `lockBaseline` (application service) rejects
an empty draft, loads and integrity-verifies each member content version, builds
canonical membership integrity inputs, computes the fingerprint, and persists it
alongside the `locked` transition in one transaction. `archiveBaseline` requires
`locked` status. `verifyBaselineIntegrity` may be called against `locked` or
`archived` baselines at any later time to detect tampering; it never mutates
membership and never re-opens a draft.
