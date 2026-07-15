# Engineering Intelligence — Engineering Health

**Milestone:** APZTCMS-021

## Summary

Deterministic `EngineeringHealth` aggregates:

- quality score
- stability
- release readiness
- risk (explainable factors)
- coverage / automation / manual execution
- certification
- pipeline health

Status bands: `healthy` (≥85) | `watch` (≥70) | `at_risk` (≥50) | `critical` (&gt;0) | `unknown`.

`isDecision: false` — advisory only; never auto-approve or auto-release.
