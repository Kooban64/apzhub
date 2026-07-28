# Versioning Model

`RequirementVersion` remains the requirement semantic version. `RequirementContentVersion` is a separately numbered, immutable record containing a canonical requirement snapshot, parent reference, actor, reason, correlation ID, and SHA-256 hash. Content version numbers increase from one per requirement and are append-only.
