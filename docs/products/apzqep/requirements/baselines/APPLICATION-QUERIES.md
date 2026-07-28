# Application Queries

`listBaselines` paginates and filters by status without loading item bodies.
`getBaseline` returns baseline metadata plus integrity fields; item bodies load
separately via `listBaselineItems` to keep the detail response bounded.
`requirementBaselineHistory` returns every baseline (any status) that includes a
given requirement, for the Requirement detail "Baseline History" panel.
`compareBaselines` is read-only membership comparison between two baselines (see
[COMPARISON.md](./COMPARISON.md)) and does not mutate either baseline.
