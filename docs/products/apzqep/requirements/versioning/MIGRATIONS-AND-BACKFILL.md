# Migrations and Backfill

Migrations `0072` and `0073` create content-version storage and constraints. Backfill appends an initial canonical version only where no version exists and is idempotent. As an operations migration convention, backfill does **not** generate Platform business audit records.
