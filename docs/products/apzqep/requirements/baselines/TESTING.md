# Testing

Domain tests cover state transitions, empty-lock rejection, deterministic
integrity fingerprints (order-independent), tamper detection, unsupported-schema
handling, and comparison including the `versionChanged` overlay. Application
tests cover full command orchestration, permission enforcement, event/audit
emission, the empty-lock failure path, integrity verification success/failure
against a re-versioned/tampered record, and resilience of core state when a
downstream search/observation hook throws. Repository contract tests exercise
the in-memory adapter against the same port used by PostgreSQL. API handler
tests cover the baseline routes including the verify endpoint, permission
denial, and confirm no unlock/delete/restore method is exposed. UI tests cover
the list, create, lock-confirmation, and compare surfaces. All ENG-020A–D
suites remain green alongside these additions.
