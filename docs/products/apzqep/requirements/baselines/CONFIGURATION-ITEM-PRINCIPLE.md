# Configuration-Item Principle

**Permanent principle:** downstream capabilities consume baselines, not mutable
Requirements.

A baseline item identifies an exact `RequirementContentVersion`. Verification,
execution, evidence, certification, reporting, and comparable future consumers
must treat the locked baseline membership as the configuration input. Changes to
the Requirement after lock do not alter that configuration.

Part 3 strengthens this principle with a cryptographic integrity fingerprint:
consumers that need assurance the pinned configuration has not been tampered
with at the storage layer should call `verifyBaselineIntegrity` (or check
`integrityVerificationStatus`) rather than trusting stored membership blindly.
