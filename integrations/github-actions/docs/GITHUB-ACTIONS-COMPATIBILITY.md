# GitHub Actions Compatibility

**Milestone:** APZTCMS-016  
**Supported API version:** `2022-11-28` (`X-GitHub-Api-Version`)

## Compatibility matrix

`buildGitHubActionsCompatibilityMatrix()` reports:

- configured vs supported API version
- `compatible` | `incompatible` | `not_checked`
- unsupported features (dispatch, rerun, cancel, artifact/log downloads)
- optional capabilities (`approvals`, `environments`)

## Operational health

| Level | Meaning |
| --- | --- |
| HEALTHY | Auth + connectivity OK; required capabilities available |
| DEGRADED | Optional gaps (e.g. approvals) or warnings |
| LIMITED | Required capability gaps or rate limit exhausted |
| UNAVAILABLE | Auth/config/connectivity/circuit/version block |

`mapOperationalHealthToSdkStatus()` maps HEALTHY→healthy, DEGRADED/LIMITED→degraded, UNAVAILABLE→unavailable.

## Feature detection

Optional probes for environments and run approvals. 404 → graceful empty / optional unavailable — never blocks adapter startup.
