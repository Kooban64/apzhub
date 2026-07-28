# Snapshot Integrity

Each immutable snapshot stores a SHA-256 hash over canonical JSON. Integrity verification recomputes the hash and reports failure through the platform error envelope. Verification requires `qep.requirements.versions.verify`; integrity failures are auditable.
