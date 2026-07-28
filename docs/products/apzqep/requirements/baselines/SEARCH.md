# Search

Baselines publish to Platform Search as `requirement_baseline` entities.

## Searchable fields

- Baseline number
- Name
- Description
- Owner / created-by display value where available
- Status

## Rules

- Baseline membership items are **not** independent top-level search results.
- Full Requirement Version snapshot content is not indexed through baseline search.
- Documents update on create, draft metadata change, lock, and archive via
  `onBaselineUpserted`.
- Search indexing failure must not corrupt baseline persistence (best-effort
  publication / existing outbox patterns).
