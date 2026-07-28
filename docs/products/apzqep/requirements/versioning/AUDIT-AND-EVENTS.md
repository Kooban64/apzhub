# Audit and Events

Create and update append Platform audit entries and publish the content-version-created domain event after persistence. Comparison records a Platform audit entry only. Migration backfill intentionally emits neither Platform business audit records nor mutation events.
