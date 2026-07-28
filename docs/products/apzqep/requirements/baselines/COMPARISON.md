# Baseline Comparison

`compareRequirementBaselineMembership` (domain) compares two baselines' items by
content-version identifier, producing `added`, `removed`, and `unchanged` lists.
It additionally derives `versionChanged`: pairs where the same `requirementId`
appears in both `added` and `removed`, meaning the requirement was re-versioned
between the two baselines rather than genuinely added or dropped. `added` and
`removed` are left unchanged for backward compatibility; `versionChanged` is an
overlay. The application service (`compareBaselines`) and API/UI expose the same
shape, including `summary.versionChangedCount`. Comparison never mutates either
baseline and requires only `qep.requirements.baselines.compare`.
